import fs from "fs";
import { 
  getMediaTypeFromMime, 
  isValidImageUrl, 
  isSupportedFileType 
} from "../utils/mediaUtils.js";
import { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from "../utils/cloudinaryUtils.js";
import { 
  createMediaContentBlock, 
  buildOpenAIInput, 
  callOpenAIDetection, 
  extractTextFromResponse, 
  parseModelOutput, 
  normalizeDetectionResult,
  isOpenAIConfigured
} from "../utils/aiUtils.js";

/**
 * Main detection controller
 * Handles file upload, Cloudinary upload, and AI detection
 */
export class DetectionController {
  /**
   * Process detection request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async detect(req, res) {
    let tempPath = null;
    let cloudinaryPublicId = null;
    
    try {
      // Determine input: file upload, remote image_url, or text body
      let mediaType = null;
      let mediaContentBlock = null;
      let providedSource = "";
      let cloudinaryUrl = null;

      // 1) File upload (multipart/form-data) - Upload to Cloudinary first
      if (req.file) {
        tempPath = req.file.path;
        const mimeType = req.file.mimetype || "application/octet-stream";
        
        // Validate file type
        if (!isSupportedFileType(mimeType)) {
          return res.status(400).json({
            error: "unsupported_file_type",
            message: `File type ${mimeType} is not supported for detection.`
          });
        }
        
        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(tempPath, mimeType);
        cloudinaryUrl = uploadResult.url;
        cloudinaryPublicId = uploadResult.publicId;
        mediaType = uploadResult.mediaType;
        providedSource = `uploaded file (mimetype=${mimeType})`;

        // Create appropriate content block for OpenAI API
        mediaContentBlock = createMediaContentBlock(mediaType, cloudinaryUrl);
      }
      // 2) Remote image URL provided in JSON body
      else if (req.body.image_url) {
        const imageUrl = req.body.image_url;
        
        // Validate the URL
        if (!isValidImageUrl(imageUrl)) {
          return res.status(400).json({
            error: "invalid_image_url",
            message: "Please provide a valid image URL with supported format (jpg, jpeg, png, gif, webp, bmp, svg).",
          });
        }
        
        mediaType = "image";
        providedSource = "image_url (body)";
        mediaContentBlock = createMediaContentBlock(mediaType, imageUrl);
      }
      // 3) Text provided in JSON body
      else if (req.body.text) {
        mediaType = "text";
        providedSource = "text (body)";
        mediaContentBlock = createMediaContentBlock(mediaType, req.body.text);
      } else {
        return res.status(400).json({
          error: "no_input",
          message: "Provide a file (file_data) or JSON body with `text` or `image_url`.",
        });
      }

      // Build the input for OpenAI API
      const requestInput = buildOpenAIInput(mediaType, mediaContentBlock);

      // Call OpenAI Responses API
      const response = await callOpenAIDetection(requestInput);

      // Extract textual output
      const modelText = extractTextFromResponse(response);

      // Try to parse JSON object from model output
      const parsed = parseModelOutput(modelText);
      
      if (!parsed) {
        // If parsing fails, respond with an "uncertain" structured object
        return res.status(200).json({
          media_type: mediaType || "unknown",
          deepfake_probability: 0,
          natural_probability: 100,
          reasoning: {
            content_analysis: "not available",
            deepfake_indicators: "not available",
            authentic_indicators: "not available",
            overall: "Model did not return strict JSON as requested. See raw_model_output for details.",
          },
          raw_model_output: modelText,
          sdk_raw: response,
          note: "Model output could not be parsed as JSON. Ensure the model returns EXACTLY the specified JSON.",
          cloudinary_url: cloudinaryUrl,
        });
      }

      // Normalize & validate the parsed result
      const normalizedResult = normalizeDetectionResult(parsed, mediaType);

      // Final structured response
      return res.json({
        ...normalizedResult,
        raw_model_output: modelText,
        sdk_raw: response,
        provided_source: providedSource,
        cloudinary_url: cloudinaryUrl,
        cloudinary_public_id: cloudinaryPublicId,
      });
      
    } catch (err) {
      console.error("Detection error:", err);
      
      // Cleanup: Remove temporary file and Cloudinary resource on error
      if (tempPath && fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {
          console.warn("Unable to remove temp file:", tempPath, e.message);
        }
      }
      
      if (cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(cloudinaryPublicId);
        } catch (e) {
          console.warn("Unable to delete Cloudinary resource:", cloudinaryPublicId, e.message);
        }
      }
      
      return res.status(500).json({
        error: "internal_error",
        message: err.message || "Unexpected server error.",
      });
    } finally {
      // Cleanup temporary file if it exists
      if (tempPath && fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {
          console.warn("Unable to remove temp file:", tempPath, e.message);
        }
      }
    }
  }

  /**
   * Health check for detection service
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async healthCheck(req, res) {
    try {
      // Check if OpenAI is configured
      const openaiConfigured = isOpenAIConfigured();
      
      // Check if Cloudinary is configured
      const cloudinaryConfigured = isCloudinaryConfigured();

      if (!openaiConfigured || !cloudinaryConfigured) {
        return res.status(503).json({
          status: "unhealthy",
          message: "Detection service configuration incomplete",
          timestamp: new Date().toISOString(),
          services: {
            openai: openaiConfigured ? "configured" : "missing API key",
            cloudinary: cloudinaryConfigured ? "configured" : "missing configuration"
          }
        });
      }

      return res.status(200).json({
        status: "healthy",
        message: "Detection service is operational",
        timestamp: new Date().toISOString(),
        services: {
          openai: "configured",
          cloudinary: "configured"
        }
      });
    } catch (error) {
      return res.status(503).json({
        status: "unhealthy",
        message: "Detection service health check failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get supported file types
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getSupportedTypes(req, res) {
    const supportedTypes = {
      images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
      videos: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'],
      audio: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
      documents: ['pdf', 'txt']
    };

    return res.json({
      supported_types: supportedTypes,
      max_file_size: "100MB",
      max_files: 5
    });
  }

  /**
   * Test Cloudinary connection (for debugging)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async testCloudinaryConnection(req, res) {
    try {
      const { configureCloudinary } = await import("../../config/cloudinary.js");
      const cloudinary = configureCloudinary();
      
      // Test connection by getting account info
      const result = await cloudinary.api.ping();
      
      return res.json({
        success: true,
        message: "Cloudinary connection successful",
        ping_result: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Cloudinary connection test failed:", error);
      return res.status(500).json({
        error: "connection_test_failed",
        message: error.message,
        details: {
          cloudinary_configured: isCloudinaryConfigured(),
          error_type: error.constructor.name
        }
      });
    }
  }

  /**
   * Test Cloudinary upload (for debugging)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async testCloudinaryUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "no_file",
          message: "Please provide a file to test upload"
        });
      }

      const tempPath = req.file.path;
      const mimeType = req.file.mimetype || "application/octet-stream";

      console.log(`Testing Cloudinary upload: ${tempPath} (${mimeType})`);

      // Test upload
      const uploadResult = await uploadToCloudinary(tempPath, mimeType);

      // Clean up the uploaded file
      try {
        await deleteFromCloudinary(uploadResult.publicId);
        console.log(`Test file deleted: ${uploadResult.publicId}`);
      } catch (deleteError) {
        console.warn(`Failed to delete test file: ${deleteError.message}`);
      }

      return res.json({
        success: true,
        message: "Cloudinary upload test successful",
        upload_result: uploadResult,
        test_completed: true
      });

    } catch (error) {
      console.error("Cloudinary upload test failed:", error);
      return res.status(500).json({
        error: "upload_test_failed",
        message: error.message,
        details: {
          cloudinary_configured: isCloudinaryConfigured(),
          file_provided: !!req.file
        }
      });
    } finally {
      // Cleanup temporary file
      if (req.file && req.file.path) {
        try {
          const fs = await import('fs');
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (e) {
          console.warn("Failed to cleanup temp file:", e.message);
        }
      }
    }
  }
}

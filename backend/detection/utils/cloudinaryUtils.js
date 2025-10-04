import { cloudinaryUtils as baseCloudinaryUtils } from "../../config/cloudinary.js";
import { getCloudinaryResourceType, getCloudinaryFolder } from "./mediaUtils.js";

/**
 * Check if Cloudinary is properly configured
 * @returns {boolean} - True if Cloudinary is configured
 */
export function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload file to Cloudinary with proper configuration
 * @param {string} filePath - Path to the file to upload
 * @param {string} mimeType - MIME type of the file
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} - Upload result with URL, public ID, and media type
 */
export async function uploadToCloudinary(filePath, mimeType, options = {}) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check if Cloudinary is configured
      if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary is not properly configured. Please check your environment variables.');
      }

      // Check if file exists
      const fs = await import('fs');
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Check file size (max 100MB)
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      if (fileSizeInMB > 100) {
        throw new Error(`File too large: ${fileSizeInMB.toFixed(2)}MB. Maximum allowed size is 100MB.`);
      }

      const { getMediaTypeFromMime } = await import("./mediaUtils.js");
      const mediaType = getMediaTypeFromMime(mimeType);
      const folder = getCloudinaryFolder(mediaType);
      const resourceType = getCloudinaryResourceType(mediaType);
      
      console.log(`Uploading file to Cloudinary (attempt ${attempt}/${maxRetries}): ${filePath} (${mediaType})`);
      
      const result = await baseCloudinaryUtils.uploadFile(filePath, {
        folder: folder,
        resource_type: resourceType,
        quality: "auto",
        fetch_format: "auto",
        timeout: 120000, // 2 minutes timeout
        chunk_size: 6000000, // 6MB chunks
        ...options
      });
      
      console.log(`Upload successful: ${result.secure_url}`);
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        mediaType: mediaType,
        originalFilename: result.original_filename,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      lastError = error;
      console.error(`Cloudinary upload error (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // If it's a timeout error and we have retries left, wait and try again
      if (attempt < maxRetries && (error.message.includes('timeout') || error.message.includes('Timeout'))) {
        const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // If it's not a timeout error or we're out of retries, throw the error
      break;
    }
  }
  
  // If we get here, all retries failed
  const errorMessage = lastError.message || lastError.error?.message || lastError.toString() || 'Unknown error';
  throw new Error(`Cloudinary upload failed after ${maxRetries} attempts: ${errorMessage}`);
}

/**
 * Delete file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @param {string} resourceType - The resource type (image, video, raw)
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteFromCloudinary(publicId, resourceType = "auto") {
  try {
    return await baseCloudinaryUtils.deleteFile(publicId, resourceType);
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    const errorMessage = error.message || error.error?.message || error.toString() || 'Unknown error';
    throw new Error(`Cloudinary deletion failed: ${errorMessage}`);
  }
}

/**
 * Get optimized URL for a Cloudinary resource
 * @param {string} publicId - The public ID
 * @param {Object} options - URL transformation options
 * @returns {string} - The optimized URL
 */
export function getOptimizedUrl(publicId, options = {}) {
  return baseCloudinaryUtils.getOptimizedUrl(publicId, options);
}

/**
 * Get thumbnail URL for a Cloudinary resource
 * @param {string} publicId - The public ID
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string} - The thumbnail URL
 */
export function getThumbnailUrl(publicId, width = 300, height = 300) {
  return baseCloudinaryUtils.getThumbnailUrl(publicId, width, height);
}

/**
 * Get file information from Cloudinary
 * @param {string} publicId - The public ID
 * @param {string} resourceType - The resource type
 * @returns {Promise<Object>} - File information
 */
export async function getFileInfo(publicId, resourceType = "auto") {
  try {
    return await baseCloudinaryUtils.getFileInfo(publicId, resourceType);
  } catch (error) {
    console.error('Cloudinary get file info error:', error);
    const errorMessage = error.message || error.error?.message || error.toString() || 'Unknown error';
    throw new Error(`Get file info failed: ${errorMessage}`);
  }
}

import { cloudinaryUtils } from "../config/cloudinary.js";

// Media utility functions
export const mediaUtils = {
  // Upload file from buffer
  uploadFromBuffer: async (buffer, options = {}) => {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              ...options,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });
    } catch (error) {
      throw new Error(`Buffer upload failed: ${error.message}`);
    }
  },

  // Upload file from URL
  uploadFromUrl: async (url, options = {}) => {
    try {
      const result = await cloudinary.uploader.upload(url, {
        resource_type: "auto",
        ...options,
      });
      return result;
    } catch (error) {
      throw new Error(`URL upload failed: ${error.message}`);
    }
  },

  // Delete multiple files
  deleteMultipleFiles: async (publicIds, resourceType = "auto") => {
    try {
      const result = await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      throw new Error(`Multiple delete failed: ${error.message}`);
    }
  },

  // Get file statistics
  getFileStats: async (publicId, resourceType = "auto") => {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
      return {
        public_id: result.public_id,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
        created_at: result.created_at,
        url: result.secure_url,
      };
    } catch (error) {
      throw new Error(`Get stats failed: ${error.message}`);
    }
  },

  // Generate responsive image URLs
  generateResponsiveUrls: (
    publicId,
    breakpoints = [320, 640, 768, 1024, 1200]
  ) => {
    return breakpoints.map((width) => ({
      width,
      url: cloudinaryUtils.getOptimizedUrl(publicId, {
        width,
        crop: "scale",
        quality: "auto",
        fetch_format: "auto",
      }),
    }));
  },

  // Generate video thumbnail
  generateVideoThumbnail: (publicId, time = "00:00:01") => {
    return cloudinaryUtils.getOptimizedUrl(publicId, {
      resource_type: "video",
      format: "jpg",
      start_offset: time,
      width: 640,
      height: 360,
      crop: "fill",
      quality: "auto",
    });
  },

  // Transform image
  transformImage: (publicId, transformations = {}) => {
    return cloudinaryUtils.getOptimizedUrl(publicId, {
      quality: "auto",
      fetch_format: "auto",
      ...transformations,
    });
  },

  // Get optimized delivery URL
  getOptimizedDeliveryUrl: (publicId, options = {}) => {
    return cloudinaryUtils.getOptimizedUrl(publicId, {
      quality: "auto",
      fetch_format: "auto",
      flags: "progressive",
      ...options,
    });
  },

  // Validate file type
  validateFileType: (mimetype, allowedTypes) => {
    return allowedTypes.includes(mimetype);
  },

  // Get file size in human readable format
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Extract file extension
  getFileExtension: (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  },

  // Check if file is image
  isImage: (mimetype) => {
    return mimetype.startsWith("image/");
  },

  // Check if file is video
  isVideo: (mimetype) => {
    return mimetype.startsWith("video/");
  },

  // Check if file is audio
  isAudio: (mimetype) => {
    return mimetype.startsWith("audio/");
  },

  // Check if file is document
  isDocument: (mimetype) => {
    const documentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/rtf",
    ];
    return documentTypes.includes(mimetype);
  },
};

export default mediaUtils;

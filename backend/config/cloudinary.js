import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Lazy initialization of Cloudinary
let cloudinaryConfigured = false;

function configureCloudinary() {
  if (!cloudinaryConfigured) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    cloudinaryConfigured = true;
    console.log('Cloudinary configured successfully');
  }
  return cloudinary;
}

// Storage configuration for different file types
const createStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: configureCloudinary(),
    params: {
      folder: folder,
      allowed_formats: allowedFormats,
      transformation: [{ quality: 95 }, { fetch_format: "auto" }],
    },
  });
};

// Lazy storage configurations - only created when needed
let _imageStorage = null;
let _videoStorage = null;
let _audioStorage = null;
let _documentStorage = null;
let _uploadAny = null;

// Image storage configuration
export const uploadImage = multer({
  storage: {
    _handleFile: async (req, file, cb) => {
      try {
        if (!_imageStorage) {
          _imageStorage = createStorage("vera/images", [
            "jpg", "jpeg", "png", "gif", "webp", "svg"
          ]);
        }
        return _imageStorage._handleFile(req, file, cb);
      } catch (error) {
        cb(error);
      }
    },
    _removeFile: (req, file, cb) => {
      if (_imageStorage) {
        _imageStorage._removeFile(req, file, cb);
      } else {
        cb();
      }
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image file type"), false);
    }
  },
});

export const uploadVideo = multer({
  storage: {
    _handleFile: async (req, file, cb) => {
      try {
        if (!_videoStorage) {
          _videoStorage = createStorage("vera/videos", [
            "mp4", "mov", "avi", "mkv", "webm", "flv"
          ]);
        }
        return _videoStorage._handleFile(req, file, cb);
      } catch (error) {
        cb(error);
      }
    },
    _removeFile: (req, file, cb) => {
      if (_videoStorage) {
        _videoStorage._removeFile(req, file, cb);
      } else {
        cb();
      }
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "video/mp4", "video/mov", "video/avi", "video/mkv", "video/webm", "video/flv",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid video file type"), false);
    }
  },
});

export const uploadAudio = multer({
  storage: {
    _handleFile: async (req, file, cb) => {
      try {
        if (!_audioStorage) {
          _audioStorage = createStorage("vera/audio", [
            "mp3", "wav", "ogg", "aac", "flac", "m4a"
          ]);
        }
        return _audioStorage._handleFile(req, file, cb);
      } catch (error) {
        cb(error);
      }
    },
    _removeFile: (req, file, cb) => {
      if (_audioStorage) {
        _audioStorage._removeFile(req, file, cb);
      } else {
        cb();
      }
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for audio
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac", "audio/mp4",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid audio file type"), false);
    }
  },
});

export const uploadDocument = multer({
  storage: {
    _handleFile: async (req, file, cb) => {
      try {
        if (!_documentStorage) {
          _documentStorage = createStorage("vera/documents", [
            "pdf", "doc", "docx", "txt", "rtf"
          ]);
        }
        return _documentStorage._handleFile(req, file, cb);
      } catch (error) {
        cb(error);
      }
    },
    _removeFile: (req, file, cb) => {
      if (_documentStorage) {
        _documentStorage._removeFile(req, file, cb);
      } else {
        cb();
      }
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf", "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain", "application/rtf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid document file type"), false);
    }
  },
});

// General upload for any file type
export const uploadAny = multer({
  storage: {
    _handleFile: async (req, file, cb) => {
      try {
        if (!_uploadAny) {
          _uploadAny = createStorage("vera/files", [
            "jpg", "jpeg", "png", "gif", "webp", "svg",
            "mp4", "mov", "avi", "mkv", "webm", "flv",
            "mp3", "wav", "ogg", "aac", "flac", "m4a",
            "pdf", "doc", "docx", "txt", "rtf",
          ]);
        }
        return _uploadAny._handleFile(req, file, cb);
      } catch (error) {
        cb(error);
      }
    },
    _removeFile: (req, file, cb) => {
      if (_uploadAny) {
        _uploadAny._removeFile(req, file, cb);
      } else {
        cb();
      }
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Cloudinary utility functions
export const cloudinaryUtils = {
  // Upload file directly
  uploadFile: async (filePath, options = {}) => {
    try {
      const client = configureCloudinary();
      
      // Add timeout and retry configuration
      const uploadOptions = {
        resource_type: "auto",
        timeout: 60000, // 60 seconds timeout
        chunk_size: 6000000, // 6MB chunks for large files
        ...options,
      };
      
      console.log(`Uploading to Cloudinary: ${filePath} with options:`, uploadOptions);
      
      const result = await client.uploader.upload(filePath, uploadOptions);
      console.log(`Upload successful: ${result.secure_url}`);
      return result;
    } catch (error) {
      console.error('Base Cloudinary upload error:', error);
      const errorMessage = error.message || error.error?.message || error.toString() || 'Unknown error';
      
      // Provide more specific error messages
      if (errorMessage.includes('Request Timeout')) {
        throw new Error(`Upload failed: Request timeout. The file may be too large or network connection is slow. Try uploading a smaller file.`);
      } else if (errorMessage.includes('Network Error')) {
        throw new Error(`Upload failed: Network error. Please check your internet connection and try again.`);
      } else if (errorMessage.includes('413')) {
        throw new Error(`Upload failed: File too large. Please upload a smaller file.`);
      } else {
        throw new Error(`Upload failed: ${errorMessage}`);
      }
    }
  },

  // Delete file by public ID
  deleteFile: async (publicId, resourceType = "auto") => {
    try {
      const client = configureCloudinary();
      const result = await client.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      console.error('Base Cloudinary deletion error:', error);
      const errorMessage = error.message || error.error?.message || error.toString() || 'Unknown error';
      throw new Error(`Delete failed: ${errorMessage}`);
    }
  },

  // Get file info
  getFileInfo: async (publicId, resourceType = "auto") => {
    try {
      const client = configureCloudinary();
      const result = await client.api.resource(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      console.error('Base Cloudinary get file info error:', error);
      const errorMessage = error.message || error.error?.message || error.toString() || 'Unknown error';
      throw new Error(`Get file info failed: ${errorMessage}`);
    }
  },

  // Generate optimized URL
  getOptimizedUrl: (publicId, options = {}) => {
    const client = configureCloudinary();
    return client.url(publicId, {
      quality: 95,
      fetch_format: "auto",
      ...options,
    });
  },

  // Generate thumbnail URL
  getThumbnailUrl: (publicId, width = 300, height = 300) => {
    const client = configureCloudinary();
    return client.url(publicId, {
      width: width,
      height: height,
      crop: "fill",
      quality: 95,
      fetch_format: "auto",
    });
  },
};

export { configureCloudinary };
export default cloudinary;

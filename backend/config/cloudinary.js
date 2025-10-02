import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for different file types
const createStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: allowedFormats,
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    },
  });
};

// Image storage configuration
const imageStorage = createStorage("vera/images", [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
]);

// Video storage configuration
const videoStorage = createStorage("vera/videos", [
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
  "flv",
]);

// Audio storage configuration
const audioStorage = createStorage("vera/audio", [
  "mp3",
  "wav",
  "ogg",
  "aac",
  "flac",
  "m4a",
]);

// Document storage configuration
const documentStorage = createStorage("vera/documents", [
  "pdf",
  "doc",
  "docx",
  "txt",
  "rtf",
]);

// Create multer instances for different file types
export const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image file type"), false);
    }
  },
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/mkv",
      "video/webm",
      "video/flv",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid video file type"), false);
    }
  },
});

export const uploadAudio = multer({
  storage: audioStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for audio
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/aac",
      "audio/flac",
      "audio/mp4",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid audio file type"), false);
    }
  },
});

export const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/rtf",
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
  storage: createStorage("vera/files", [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "mp4",
    "mov",
    "avi",
    "mkv",
    "webm",
    "flv",
    "mp3",
    "wav",
    "ogg",
    "aac",
    "flac",
    "m4a",
    "pdf",
    "doc",
    "docx",
    "txt",
    "rtf",
  ]),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Cloudinary utility functions
export const cloudinaryUtils = {
  // Upload file directly
  uploadFile: async (filePath, options = {}) => {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
        ...options,
      });
      return result;
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  },

  // Delete file by public ID
  deleteFile: async (publicId, resourceType = "auto") => {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  },

  // Get file info
  getFileInfo: async (publicId, resourceType = "auto") => {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      throw new Error(`Get file info failed: ${error.message}`);
    }
  },

  // Generate optimized URL
  getOptimizedUrl: (publicId, options = {}) => {
    return cloudinary.url(publicId, {
      quality: "auto",
      fetch_format: "auto",
      ...options,
    });
  },

  // Generate thumbnail URL
  getThumbnailUrl: (publicId, width = 300, height = 300) => {
    return cloudinary.url(publicId, {
      width: width,
      height: height,
      crop: "fill",
      quality: "auto",
      fetch_format: "auto",
    });
  },
};

export default cloudinary;

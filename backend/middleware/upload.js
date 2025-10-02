import {
  uploadAny,
  uploadAudio,
  uploadDocument,
  uploadImage,
  uploadVideo,
} from "../config/cloudinary.js";

// Middleware for single file uploads
export const uploadSingleImage = uploadImage.single("image");
export const uploadSingleVideo = uploadVideo.single("video");
export const uploadSingleAudio = uploadAudio.single("audio");
export const uploadSingleDocument = uploadDocument.single("document");
export const uploadSingleFile = uploadAny.single("file");

// Middleware for multiple file uploads
export const uploadMultipleImages = uploadImage.array("images", 10);
export const uploadMultipleVideos = uploadVideo.array("videos", 5);
export const uploadMultipleAudio = uploadAudio.array("audio", 10);
export const uploadMultipleDocuments = uploadDocument.array("documents", 10);
export const uploadMultipleFiles = uploadAny.array("files", 10);

// Middleware for mixed file uploads
export const uploadMixedFiles = uploadAny.fields([
  { name: "images", maxCount: 5 },
  { name: "videos", maxCount: 3 },
  { name: "audio", maxCount: 5 },
  { name: "documents", maxCount: 5 },
]);

// Error handling middleware for uploads
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "File too large. Please check the file size limits.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        status: "error",
        message: "Too many files. Please check the file count limits.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        status: "error",
        message: "Unexpected file field.",
      });
    }
  }

  if (error.message.includes("Invalid")) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }

  next(error);
};

// Utility function to extract file info from Cloudinary result
export const extractFileInfo = (cloudinaryResult) => {
  return {
    public_id: cloudinaryResult.public_id,
    secure_url: cloudinaryResult.secure_url,
    url: cloudinaryResult.url,
    format: cloudinaryResult.format,
    resource_type: cloudinaryResult.resource_type,
    bytes: cloudinaryResult.bytes,
    width: cloudinaryResult.width,
    height: cloudinaryResult.height,
    duration: cloudinaryResult.duration, // for videos/audio
    created_at: cloudinaryResult.created_at,
  };
};

// Middleware to add file info to request
export const addFileInfo = (req, res, next) => {
  if (req.file) {
    req.fileInfo = extractFileInfo(req.file);
  }
  if (req.files) {
    req.filesInfo = req.files.map((file) => extractFileInfo(file));
  }
  next();
};

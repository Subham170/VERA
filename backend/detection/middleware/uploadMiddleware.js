import multer from "multer";
import { isSupportedFileType } from "../utils/mediaUtils.js";

// Temporary upload for processing before Cloudinary upload
const tempUpload = multer({ 
  dest: "uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (isSupportedFileType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

/**
 * Middleware for single file upload
 */
export const uploadSingle = tempUpload.single("file_data");

/**
 * Middleware for multiple file uploads
 */
export const uploadMultiple = tempUpload.array("file_data", 5); // Max 5 files

/**
 * Error handler for multer errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: "file_too_large",
        message: "File size exceeds the maximum limit of 100MB."
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: "too_many_files",
        message: "Too many files uploaded. Maximum 5 files allowed."
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: "unexpected_file_field",
        message: "Unexpected file field. Use 'file_data' as the field name."
      });
    }
  }
  
  if (err.message.includes('Unsupported file type')) {
    return res.status(400).json({
      error: "unsupported_file_type",
      message: err.message
    });
  }
  
  next(err);
};

export default tempUpload;

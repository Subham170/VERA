import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tag-specific storage configuration
const tagImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vera/tags/images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    transformation: [
      { quality: "auto" },
      { fetch_format: "auto" }
    ],
  },
});

const tagVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vera/tags/videos",
    allowed_formats: ["mp4", "mov", "avi", "mkv", "webm", "flv"],
    transformation: [
      { quality: "auto" },
      { fetch_format: "auto" }
    ],
  },
});

const tagAudioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vera/tags/audio",
    allowed_formats: ["mp3", "wav", "ogg", "aac", "flac", "m4a"],
    transformation: [
      { quality: "auto" },
      { fetch_format: "auto" }
    ],
  },
});

// Multer configuration for tag images
export const uploadTagImages = multer({
  storage: tagImageStorage,
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
      cb(new Error("Invalid image file type. Only JPG, PNG, GIF, WebP, and SVG are allowed."), false);
    }
  },
});

// Multer configuration for tag videos
export const uploadTagVideos = multer({
  storage: tagVideoStorage,
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
      cb(new Error("Invalid video file type. Only MP4, MOV, AVI, MKV, WebM, and FLV are allowed."), false);
    }
  },
});

// Multer configuration for tag audio
export const uploadTagAudio = multer({
  storage: tagAudioStorage,
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
      cb(new Error("Invalid audio file type. Only MP3, WAV, OGG, AAC, FLAC, and M4A are allowed."), false);
    }
  },
});

// Middleware for handling multiple image uploads
export const handleTagImageUpload = (fieldName = "images", maxCount = 10) => {
  return (req, res, next) => {
    const upload = uploadTagImages.array(fieldName, maxCount);
    
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }
      
      // Process uploaded files and add URLs to req.body
      if (req.files && req.files.length > 0) {
        req.body.img_urls = req.files.map(file => file.secure_url);
      }
      
      next();
    });
  };
};

// Middleware for handling multiple video uploads
export const handleTagVideoUpload = (fieldName = "videos", maxCount = 10) => {
  return (req, res, next) => {
    const upload = uploadTagVideos.array(fieldName, maxCount);
    
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }
      
      // Process uploaded files and add URLs to req.body
      if (req.files && req.files.length > 0) {
        req.body.video_urls = req.files.map(file => file.secure_url);
      }
      
      next();
    });
  };
};

// Middleware for handling multiple audio uploads
export const handleTagAudioUpload = (fieldName = "audio", maxCount = 10) => {
  return (req, res, next) => {
    const upload = uploadTagAudio.array(fieldName, maxCount);
    
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }
      
      // Process uploaded files and add URLs to req.body
      if (req.files && req.files.length > 0) {
        req.body.audio_urls = req.files.map(file => file.secure_url);
      }
      
      next();
    });
  };
};

// Middleware for handling mixed media uploads
export const handleTagMixedUpload = () => {
  return (req, res, next) => {
    const imageUpload = uploadTagImages.array("images", 10);
    const videoUpload = uploadTagVideos.array("videos", 10);
    const audioUpload = uploadTagAudio.array("audio", 10);
    
    let uploadCount = 0;
    let totalUploads = 0;
    const errors = [];
    
    // Count total uploads
    if (req.body.images) totalUploads++;
    if (req.body.videos) totalUploads++;
    if (req.body.audio) totalUploads++;
    
    const handleUploadComplete = (err, fieldName) => {
      if (err) {
        errors.push(`${fieldName}: ${err.message}`);
      }
      
      uploadCount++;
      if (uploadCount >= totalUploads) {
        if (errors.length > 0) {
          return res.status(400).json({
            status: "error",
            message: "Upload errors",
            errors: errors,
          });
        }
        next();
      }
    };
    
    // Handle image uploads
    if (req.body.images) {
      imageUpload(req, res, (err) => {
        if (err) {
          handleUploadComplete(err, "images");
        } else {
          if (req.files && req.files.length > 0) {
            req.body.img_urls = req.files.map(file => file.secure_url);
          }
          handleUploadComplete(null, "images");
        }
      });
    }
    
    // Handle video uploads
    if (req.body.videos) {
      videoUpload(req, res, (err) => {
        if (err) {
          handleUploadComplete(err, "videos");
        } else {
          if (req.files && req.files.length > 0) {
            req.body.video_urls = req.files.map(file => file.secure_url);
          }
          handleUploadComplete(null, "videos");
        }
      });
    }
    
    // Handle audio uploads
    if (req.body.audio) {
      audioUpload(req, res, (err) => {
        if (err) {
          handleUploadComplete(err, "audio");
        } else {
          if (req.files && req.files.length > 0) {
            req.body.audio_urls = req.files.map(file => file.secure_url);
          }
          handleUploadComplete(null, "audio");
        }
      });
    }
  };
};

// Utility function to delete media from Cloudinary
export const deleteCloudinaryMedia = async (url) => {
  try {
    if (!url) return;
    
    // Extract public ID from Cloudinary URL
    const urlParts = url.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    const fullPublicId = `vera/tags/${folder}/${publicId}`;
    
    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    console.error("Error deleting media from Cloudinary:", error);
    // Don't throw error as this is cleanup operation
  }
};

// Utility function to delete multiple media URLs
export const deleteMultipleCloudinaryMedia = async (urls) => {
  try {
    if (!urls || urls.length === 0) return;
    
    const deletePromises = urls.map(url => deleteCloudinaryMedia(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting multiple media from Cloudinary:", error);
  }
};

export default {
  uploadTagImages,
  uploadTagVideos,
  uploadTagAudio,
  handleTagImageUpload,
  handleTagVideoUpload,
  handleTagAudioUpload,
  handleTagMixedUpload,
  deleteCloudinaryMedia,
  deleteMultipleCloudinaryMedia,
};

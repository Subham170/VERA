import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for user images
const userImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vera/users",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
  },
});

// Create multer instance for user images
export const uploadUserImages = multer({
  storage: userImageStorage,
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
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image file type"), false);
    }
  },
});

// Middleware for uploading profile and banner images
export const uploadProfileAndBanner = uploadUserImages.fields([
  { name: "profile_img", maxCount: 1 },
  { name: "banner_url", maxCount: 1 },
]);

// Middleware for uploading only profile image
export const uploadProfileImage = uploadUserImages.single("profile_img");

// Middleware for uploading only banner image
export const uploadBannerImage = uploadUserImages.single("banner_url");

// Error handling middleware for user uploads
export const handleUserUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "Image file too large. Maximum size is 10MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        status: "error",
        message: "Too many files. Only one image per field is allowed.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        status: "error",
        message: "Unexpected file field. Use 'profile_img' or 'banner_url'.",
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
export const extractUserFileInfo = (cloudinaryResult) => {
  return {
    public_id: cloudinaryResult.public_id,
    secure_url: cloudinaryResult.secure_url,
    url: cloudinaryResult.url,
    format: cloudinaryResult.format,
    resource_type: cloudinaryResult.resource_type,
    bytes: cloudinaryResult.bytes,
    width: cloudinaryResult.width,
    height: cloudinaryResult.height,
    created_at: cloudinaryResult.created_at,
  };
};

// Middleware to add file info to request
export const addUserFileInfo = (req, res, next) => {
  if (req.files) {
    req.filesInfo = {};

    if (req.files.profile_img) {
      req.filesInfo.profile_img = extractUserFileInfo(req.files.profile_img[0]);
    }

    if (req.files.banner_url) {
      req.filesInfo.banner_url = extractUserFileInfo(req.files.banner_url[0]);
    }
  }

  if (req.file) {
    req.fileInfo = extractUserFileInfo(req.file);
  }

  next();
};

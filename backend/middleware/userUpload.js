import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// User-specific storage configuration
const userImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vera/users",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    transformation: [
      { quality: "auto" },
      { fetch_format: "auto" }
    ],
  },
});

// Multer configuration for user images
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
      "image/svg+xml",
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image file type. Only JPG, PNG, GIF, WebP, and SVG are allowed."), false);
    }
  },
});

// Middleware for handling multiple image fields
export const handleUserImageUpload = (fields) => {
  return (req, res, next) => {
    const upload = uploadUserImages.fields(fields);
    
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }
      
      // Process uploaded files and add URLs to req.body
      if (req.files) {
        // Handle profile image
        if (req.files.profile_img && req.files.profile_img[0]) {
          req.body.profile_img = req.files.profile_img[0].secure_url;
        }
        
        // Handle banner image
        if (req.files.banner_url && req.files.banner_url[0]) {
          req.body.banner_url = req.files.banner_url[0].secure_url;
        }
      }
      
      next();
    });
  };
};

// Middleware for single image upload (profile or banner)
export const handleSingleImageUpload = (fieldName) => {
  return (req, res, next) => {
    const upload = uploadUserImages.single(fieldName);
    
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }
      
      // Process uploaded file and add URL to req.body
      if (req.file) {
        req.body[fieldName] = req.file.secure_url;
      }
      
      next();
    });
  };
};

// Utility function to delete old images from Cloudinary
export const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Extract public ID from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    const fullPublicId = `vera/users/${publicId}`;
    
    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    // Don't throw error as this is cleanup operation
  }
};

export default {
  uploadUserImages,
  handleUserImageUpload,
  handleSingleImageUpload,
  deleteCloudinaryImage,
};

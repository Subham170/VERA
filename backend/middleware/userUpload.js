import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const userImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vera/users",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    transformation: [
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  },
});


const uploadUserImages = multer({
  storage: userImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only JPG, PNG, GIF, WebP, and SVG are allowed."), false);
  },
});


export const handleUserImageUpload = (fields) => {
  return (req, res) => {
    const upload = uploadUserImages.fields(fields);
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }

      const uploadedUrls = {};

      if (req.files) {
        if (req.files.profile_img?.[0]) {
          uploadedUrls.profile_img = req.files.profile_img[0].path; 
        }
        if (req.files.banner_url?.[0]) {
          uploadedUrls.banner_url = req.files.banner_url[0].path;
        }
      }

      return res.status(200).json({
        status: "success",
        message: "Images uploaded successfully",
        urls: uploadedUrls,
      });
    });
  };
};


export const handleSingleImageUpload = (fieldName) => {
  return (req, res) => {
    const upload = uploadUserImages.single(fieldName);
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No file uploaded",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Image uploaded successfully",
        url: req.file.path, 
      });
    });
  };
};


export const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const urlParts = imageUrl.split("/");
    const publicId = urlParts[urlParts.length - 1].split(".")[0];
    const fullPublicId = `vera/users/${publicId}`;

    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    console.error("Error deleting Cloudinary image:", error);
  }
};

export default {
  uploadUserImages,
  handleUserImageUpload,
  handleSingleImageUpload,
  deleteCloudinaryImage,
};

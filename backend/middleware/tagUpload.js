import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cloudinary Storage Instances
const tagImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vera/tags/images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
  },
});

const tagVideoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vera/tags/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi", "mkv", "webm"],
  },
});

const tagAudioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vera/tags/audio",
    resource_type: "video",
    allowed_formats: ["mp3", "wav", "ogg", "aac", "flac", "m4a"],
  },
});

// 3. Multer Instances
const uploadTagImages = multer({
  storage: tagImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid image file type"), false);
  },
});

const uploadTagVideos = multer({
  storage: tagVideoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/webm",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid video file type"), false);
  },
});

const uploadTagAudio = multer({
  storage: tagAudioStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/aac",
      "audio/flac",
      "audio/mp4",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid audio file type"), false);
  },
});

// 4. Middleware Handlers for File Uploads
export const handleTagImageUpload = (fieldName = "images", maxCount = 10) => {
  const upload = uploadTagImages.array(fieldName, maxCount);
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err)
        return res.status(400).json({ status: "error", message: err.message });
      if (req.files && req.files.length > 0)
        req.body.img_urls = req.files.map((f) => f.secure_url || f.path);
      next();
    });
  };
};

export const handleTagVideoUpload = (fieldName = "videos", maxCount = 10) => {
  const upload = uploadTagVideos.array(fieldName, maxCount);
  console.log("aman madarchod", upload);
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err)
        return res.status(400).json({ status: "error", message: err.message });
      if (req.files && req.files.length > 0)
        req.body.video_urls = req.files.map((f) => f.secure_url || f.path);
      next();
    });
  };
};

export const handleTagAudioUpload = (fieldName = "audio", maxCount = 10) => {
  const upload = uploadTagAudio.array(fieldName, maxCount);
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err)
        return res.status(400).json({ status: "error", message: err.message });
      if (req.files && req.files.length > 0)
        req.body.audio_urls = req.files.map((f) => f.secure_url || f.path);
      next();
    });
  };
};

export const handleTagMixedUpload = () => {
  const upload = multer({
    limits: { fileSize: 100 * 1024 * 1024 },
  }).fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 10 },
    { name: "audio", maxCount: 10 },
  ]);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ status: "error", message: err.message });
      }
      if (req.files) {
        if (req.files.images) {
          req.body.img_urls = req.files.images.map(
            (f) => f.secure_url || f.path
          );
        }
        if (req.files.videos) {
          req.body.video_urls = req.files.videos.map(
            (f) => f.secure_url || f.path
          );
        }
        if (req.files.audio) {
          req.body.audio_urls = req.files.audio.map(
            (f) => f.secure_url || f.path
          );
        }
      }
      next();
    });
  };
};

export const applyCloudinaryWatermark = (req, res) => {
  const getPublicIdFromUrl = (url) => {
    const regex = /(?:video|image)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  try {
    const { mediaUrl, watermarkUrl, mediaType = "video" } = req.body;

    if (!mediaUrl || !watermarkUrl) {
      return res.status(400).json({
        status: "error",
        message: "Both mediaUrl and watermarkUrl are required.",
      });
    }

    const mediaPublicId = getPublicIdFromUrl(mediaUrl);
    const watermarkPublicId = getPublicIdFromUrl(watermarkUrl);

    if (!mediaPublicId || !watermarkPublicId) {
      return res.status(400).json({
        status: "error",
        message: "Could not parse valid public IDs from the provided URLs.",
      });
    }

    const safeWatermarkId = watermarkPublicId.replace(/\//g, ":");

    // Determine resource type based on media type
    const resourceType = mediaType === "img" ? "image" : "video";

    let watermarkedUrl;

    if (mediaType === "img") {
      // For image files, apply watermark overlay
      watermarkedUrl = cloudinary.url(mediaPublicId, {
        cloud_name: "dmxn5vut7",
        resource_type: "image",
        transformation: [
          {
            overlay: safeWatermarkId,
            gravity: "north_west",
            x: 10,
            y: 10,
            width: 20,
            opacity: 80,
          },
        ],
      });
    } else {
      // For video files, apply watermark overlay
      watermarkedUrl = cloudinary.url(mediaPublicId, {
        cloud_name: "dmxn5vut7",
        resource_type: "video",
        transformation: [
          {
            overlay: safeWatermarkId,
            gravity: "north_west",
            x: 10,
            y: 10,
            width: 20,
            opacity: 80,
          },
        ],
      });
    }

    return res.status(200).json({
      status: "success",
      data: { watermarkedUrl },
    });
  } catch (error) {
    console.error("Error creating watermarked URL:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create watermarked URL.",
      details: error.message,
    });
  }
};

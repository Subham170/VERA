import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    allowed_formats: ["mp4", "mov", "avi", "mkv", "webm", "flv"],
    transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
  },
});

const tagAudioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vera/tags/audio",
    allowed_formats: ["mp3", "wav", "ogg", "aac", "flac", "m4a"],
    transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
  },
});

const uploadTagImages = multer({
  storage: tagImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Invalid image file type"), false);
  },
});

const uploadTagVideos = multer({
  storage: tagVideoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["video/mp4", "video/mov", "video/avi", "video/mkv", "video/webm", "video/flv"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Invalid video file type"), false);
  },
});

const uploadTagAudio = multer({
  storage: tagAudioStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac", "audio/mp4"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Invalid audio file type"), false);
  },
});

export const handleTagImageUpload = (fieldName = "images", maxCount = 10) => {
  const upload = uploadTagImages.array(fieldName, maxCount);
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ status: "error", message: err.message });
      if (req.files && req.files.length > 0) req.body.img_urls = req.files.map(f => f.path || f.secure_url);
      next();
    });
  };
};

export const handleTagVideoUpload = (fieldName = "videos", maxCount = 10) => {
  const upload = uploadTagVideos.array(fieldName, maxCount);
  return (req, res, next) => {
    upload(req, res, (err) => {
      console.log(err.message);
      if (err) return res.status(400).json({ status: "error", message: err.message });
      if (req.files && req.files.length > 0) req.body.video_urls = req.files.map(f => f.path || f.secure_url);
      next();
    });
  };
};

export const handleTagAudioUpload = (fieldName = "audio", maxCount = 10) => {
  const upload = uploadTagAudio.array(fieldName, maxCount);
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ status: "error", message: err.message });
      if (req.files && req.files.length > 0) req.body.audio_urls = req.files.map(f => f.path || f.secure_url);
      next();
    });
  };
};

export const handleTagMixedUpload = () => {
  return (req, res, next) => {
    const imageUpload = uploadTagImages.array("images", 10);
    const videoUpload = uploadTagVideos.array("videos", 10);
    const audioUpload = uploadTagAudio.array("audio", 10);

    let uploadCount = 0;
    let totalUploads = 0;
    const errors = [];

    if (req.body.images) totalUploads++;
    if (req.body.videos) totalUploads++;
    if (req.body.audio) totalUploads++;

    const handleUploadComplete = (err, fieldName) => {
      if (err) errors.push(`${fieldName}: ${err.message}`);
      uploadCount++;
      if (uploadCount >= totalUploads) {
        if (errors.length > 0) return res.status(400).json({ status: "error", message: "Upload errors", errors });
        next();
      }
    };

    if (req.body.images) {
      imageUpload(req, res, (err) => {
        if (!err && req.files) req.body.img_urls = req.files.map(f => f.path || f.secure_url);
        handleUploadComplete(err, "images");
      });
    }

    if (req.body.videos) {
      videoUpload(req, res, (err) => {
        if (!err && req.files) req.body.video_urls = req.files.map(f => f.path || f.secure_url);
        handleUploadComplete(err, "videos");
      });
    }

    if (req.body.audio) {
      audioUpload(req, res, (err) => {
        if (!err && req.files) req.body.audio_urls = req.files.map(f => f.path || f.secure_url);
        handleUploadComplete(err, "audio");
      });
    }
  };
};

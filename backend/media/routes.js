import express from "express";
import { cloudinaryUtils } from "../config/cloudinary.js";
import {
  addFileInfo,
  handleUploadError,
  uploadMixedFiles,
  uploadMultipleAudio,
  uploadMultipleDocuments,
  uploadMultipleFiles,
  uploadMultipleImages,
  uploadMultipleVideos,
  uploadSingleAudio,
  uploadSingleDocument,
  uploadSingleFile,
  uploadSingleImage,
  uploadSingleVideo,
} from "../middleware/upload.js";
import { mediaUtils } from "../utils/mediaUtils.js";

const router = express.Router();

// Single file upload routes
router.post("/upload/image", uploadSingleImage, addFileInfo, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Image uploaded successfully",
    data: req.fileInfo,
  });
});

router.post("/upload/video", uploadSingleVideo, addFileInfo, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Video uploaded successfully",
    data: req.fileInfo,
  });
});

router.post("/upload/audio", uploadSingleAudio, addFileInfo, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Audio uploaded successfully",
    data: req.fileInfo,
  });
});

router.post(
  "/upload/document",
  uploadSingleDocument,
  addFileInfo,
  (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Document uploaded successfully",
      data: req.fileInfo,
    });
  }
);

router.post("/upload/file", uploadSingleFile, addFileInfo, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "File uploaded successfully",
    data: req.fileInfo,
  });
});

// Multiple file upload routes
router.post("/upload/images", uploadMultipleImages, addFileInfo, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Images uploaded successfully",
    count: req.filesInfo.length,
    data: req.filesInfo,
  });
});

router.post("/upload/videos", uploadMultipleVideos, addFileInfo, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Videos uploaded successfully",
    count: req.filesInfo.length,
    data: req.filesInfo,
  });
});

router.post("/upload/audio", uploadMultipleAudio, addFileInfo, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Audio files uploaded successfully",
    count: req.filesInfo.length,
    data: req.filesInfo,
  });
});

router.post(
  "/upload/documents",
  uploadMultipleDocuments,
  addFileInfo,
  (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Documents uploaded successfully",
      count: req.filesInfo.length,
      data: req.filesInfo,
    });
  }
);

router.post("/upload/files", uploadMultipleFiles, addFileInfo, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Files uploaded successfully",
    count: req.filesInfo.length,
    data: req.filesInfo,
  });
});

// Mixed file upload route
router.post("/upload/mixed", uploadMixedFiles, addFileInfo, (req, res) => {
  const uploadedFiles = {};

  if (req.files.images) {
    uploadedFiles.images = req.files.images.map((file) =>
      mediaUtils.extractFileInfo(file)
    );
  }
  if (req.files.videos) {
    uploadedFiles.videos = req.files.videos.map((file) =>
      mediaUtils.extractFileInfo(file)
    );
  }
  if (req.files.audio) {
    uploadedFiles.audio = req.files.audio.map((file) =>
      mediaUtils.extractFileInfo(file)
    );
  }
  if (req.files.documents) {
    uploadedFiles.documents = req.files.documents.map((file) =>
      mediaUtils.extractFileInfo(file)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Mixed files uploaded successfully",
    data: uploadedFiles,
  });
});

// File management routes
router.delete("/delete/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = "auto" } = req.query;

    const result = await cloudinaryUtils.deleteFile(publicId, resourceType);

    res.status(200).json({
      status: "success",
      message: "File deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/info/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = "auto" } = req.query;

    const fileInfo = await cloudinaryUtils.getFileInfo(publicId, resourceType);

    res.status(200).json({
      status: "success",
      data: fileInfo,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/optimized/:publicId", (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop, quality } = req.query;

    const optimizedUrl = cloudinaryUtils.getOptimizedUrl(publicId, {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      crop: crop || "fill",
      quality: quality || "auto",
    });

    res.status(200).json({
      status: "success",
      data: {
        public_id: publicId,
        optimized_url: optimizedUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/thumbnail/:publicId", (req, res) => {
  try {
    const { publicId } = req.params;
    const { width = 300, height = 300 } = req.query;

    const thumbnailUrl = cloudinaryUtils.getThumbnailUrl(
      publicId,
      parseInt(width),
      parseInt(height)
    );

    res.status(200).json({
      status: "success",
      data: {
        public_id: publicId,
        thumbnail_url: thumbnailUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Error handling middleware
router.use(handleUploadError);

export default router;

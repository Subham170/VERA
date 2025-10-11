import express from "express";
import { DetectionController } from "../controllers/detectionController.js";
import { uploadSingle, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * @route   POST /detect
 * @desc    Detect deepfakes in uploaded media or text
 * @access  Public
 * @body    {file_data} - File upload (multipart/form-data)
 * @body    {image_url} - Image URL (JSON)
 * @body    {text} - Text content (JSON)
 */
router.post("/detect", uploadSingle, handleUploadError, DetectionController.detect);

/**
 * @route   GET /detect/health
 * @desc    Health check for detection service
 * @access  Public
 */
router.get("/detect/health", DetectionController.healthCheck);

/**
 * @route   GET /detect/supported-types
 * @desc    Get supported file types and limits
 * @access  Public
 */
router.get("/detect/supported-types", DetectionController.getSupportedTypes);

/**
 * @route   GET /detect/test-connection
 * @desc    Test Cloudinary connection (for debugging)
 * @access  Public
 */
router.get("/detect/test-connection", DetectionController.testCloudinaryConnection);

/**
 * @route   POST /detect/test-upload
 * @desc    Test Cloudinary upload (for debugging)
 * @access  Public
 * @body    {file_data} - File upload (multipart/form-data)
 */
router.post("/detect/test-upload", uploadSingle, handleUploadError, DetectionController.testCloudinaryUpload);

export default router;

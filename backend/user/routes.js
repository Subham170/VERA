import express from "express";
const router = express.Router();

// Import user controller
import userController from "./controller.js";

// Import upload middleware
import {
  addUserFileInfo,
  handleUserUploadError,
  uploadBannerImage,
  uploadProfileAndBanner,
  uploadProfileImage,
} from "../middleware/userUpload.js";

// User routes
router.get("/", userController.getAllUsers); // GET /api/users - Get all users
router.get("/id/:id", userController.getUserById); // GET /api/users/id/:id - Get user by ID
router.get("/username/:username", userController.getUserByUsername); // GET /api/users/username/:username - Get user by username
router.get("/email/:email", userController.getUserByEmail); // GET /api/users/email/:email - Get user by email

// Create user with image uploads
router.post(
  "/",
  uploadProfileAndBanner,
  addUserFileInfo,
  userController.createUser
);

// Update user with image uploads
router.put(
  "/:id",
  uploadProfileAndBanner,
  addUserFileInfo,
  userController.updateUser
);

// Update only profile image
router.put(
  "/:id/profile-image",
  uploadProfileImage,
  addUserFileInfo,
  userController.updateUser
);

// Update only banner image
router.put(
  "/:id/banner-image",
  uploadBannerImage,
  addUserFileInfo,
  userController.updateUser
);

router.delete("/:id", userController.deleteUser); // DELETE /api/users/:id - Delete user

// Error handling middleware
router.use(handleUserUploadError);

export default router;

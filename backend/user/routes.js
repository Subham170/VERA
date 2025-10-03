import express from "express";
import { createUser, getUserByAddress, updateUserByAddress, updateUserImagesByAddress } from "./controller.js";
import { handleUserImageUpload, handleSingleImageUpload } from "../middleware/userUpload.js";

const router = express.Router();

// POST /api/users - Create a new user with address
router.post("/", createUser);

// GET /api/users/:address - Get user by address
router.get("/:address", getUserByAddress);

// PUT /api/users/:address - Update user by address (supports both JSON and form-data)
router.put("/:address", updateUserByAddress);

// PUT /api/users/:address/images - Update user images by address (form-data only)
router.put("/:address/images", 
  handleUserImageUpload([
    { name: 'profile_img', maxCount: 1 },
    { name: 'banner_url', maxCount: 1 }
  ]), 
  updateUserImagesByAddress
);

// PUT /api/users/:address/profile-image - Update only profile image
router.put("/:address/profile-image", 
  handleSingleImageUpload('profile_img'), 
  updateUserImagesByAddress
);

// PUT /api/users/:address/banner-image - Update only banner image
router.put("/:address/banner-image", 
  handleSingleImageUpload('banner_url'), 
  updateUserImagesByAddress
);

export default router;


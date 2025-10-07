import express from "express";
import {
  createUser,
  getUserByAddress,
  updateUserByAddress,
  updateUserImagesByAddress,
} from "./controller.js";
import {
  handleUserImageUpload,
  handleSingleImageUpload,
} from "../middleware/userUpload.js";

const router = express.Router();

router.post("/", createUser);

router.get("/:address", getUserByAddress);

router.put("/:address", updateUserByAddress);

router.put(
  "/:address/images",
  handleUserImageUpload([
    { name: "profile_img", maxCount: 1 },
    { name: "banner_url", maxCount: 1 },
  ]),
  updateUserImagesByAddress
);

router.put(
  "/:address/profile-image",
  handleSingleImageUpload("profile_img"),
  updateUserImagesByAddress
);

router.put(
  "/:address/banner-image",
  handleSingleImageUpload("banner_url"),
  updateUserImagesByAddress
);

export default router;

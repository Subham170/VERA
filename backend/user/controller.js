import User from "./model.js";
import { deleteCloudinaryImage } from "../middleware/userUpload.js";

// Create a new user with address
export const createUser = async (req, res) => {
  try {
    const { address } = req.body;

    // Validate required fields
    if (!address) {
      return res.status(400).json({
        status: "error",
        message: "Address is required",
      });
    }

    // Check if user with this address already exists
    const existingUser = await User.findOne({ address });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "User with this address already exists",
      });
    }

    // Create new user
    const user = new User({ address });
    await user.save();

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        user: {
          id: user._id,
          address: user.address,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user by address
export const getUserByAddress = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        status: "error",
        message: "Address parameter is required",
      });
    }

    const user = await User.findOne({ address });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user._id,
          address: user.address,
          username: user.username,
          email: user.email,
          bio: user.bio,
          profile_img: user.profile_img,
          banner_url: user.banner_url,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update user by address
export const updateUserByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const updateData = req.body;

    if (!address) {
      return res.status(400).json({
        status: "error",
        message: "Address parameter is required",
      });
    }

    // Remove address from update data to prevent changing the address
    delete updateData.address;

    // Validate update data
    const allowedFields = ["username", "email", "bio", "profile_img", "banner_url"];
    const updateFields = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No valid fields to update",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ address });
    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check for unique field conflicts
    if (updateFields.username) {
      const usernameExists = await User.findOne({ 
        username: updateFields.username, 
        _id: { $ne: existingUser._id } 
      });
      if (usernameExists) {
        return res.status(409).json({
          status: "error",
          message: "Username already exists",
        });
      }
    }

    if (updateFields.email) {
      const emailExists = await User.findOne({ 
        email: updateFields.email, 
        _id: { $ne: existingUser._id } 
      });
      if (emailExists) {
        return res.status(409).json({
          status: "error",
          message: "Email already exists",
        });
      }
    }

    // Store old image URLs for cleanup
    const oldProfileImg = existingUser.profile_img;
    const oldBannerUrl = existingUser.banner_url;

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { address },
      updateFields,
      { new: true, runValidators: true }
    );

    // Clean up old images from Cloudinary if they were replaced
    if (updateFields.profile_img && oldProfileImg && oldProfileImg !== updateFields.profile_img) {
      await deleteCloudinaryImage(oldProfileImg);
    }
    if (updateFields.banner_url && oldBannerUrl && oldBannerUrl !== updateFields.banner_url) {
      await deleteCloudinaryImage(oldBannerUrl);
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          address: updatedUser.address,
          username: updatedUser.username,
          email: updatedUser.email,
          bio: updatedUser.bio,
          profile_img: updatedUser.profile_img,
          banner_url: updatedUser.banner_url,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: errors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        status: "error",
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to update user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update user images by address (profile_img and banner_url)
export const updateUserImagesByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const { profile_img, banner_url } = req.body;

    if (!address) {
      return res.status(400).json({
        status: "error",
        message: "Address parameter is required",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ address });
    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Prepare update fields
    const updateFields = {};
    if (profile_img !== undefined) updateFields.profile_img = profile_img;
    if (banner_url !== undefined) updateFields.banner_url = banner_url;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No image fields to update",
      });
    }

    // Store old image URLs for cleanup
    const oldProfileImg = existingUser.profile_img;
    const oldBannerUrl = existingUser.banner_url;

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { address },
      updateFields,
      { new: true, runValidators: true }
    );

    // Clean up old images from Cloudinary if they were replaced
    if (updateFields.profile_img && oldProfileImg && oldProfileImg !== updateFields.profile_img) {
      await deleteCloudinaryImage(oldProfileImg);
    }
    if (updateFields.banner_url && oldBannerUrl && oldBannerUrl !== updateFields.banner_url) {
      await deleteCloudinaryImage(oldBannerUrl);
    }

    res.status(200).json({
      status: "success",
      message: "User images updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          address: updatedUser.address,
          profile_img: updatedUser.profile_img,
          banner_url: updatedUser.banner_url,
          updatedAt: updatedUser.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error updating user images:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: errors,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to update user images",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


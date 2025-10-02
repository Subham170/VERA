import User from "./model.js";

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");
    res.status(200).json({
      status: "success",
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get user by username
const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-__v"
    );
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get user by email
const getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select("-__v");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create new user with image uploads
const createUser = async (req, res) => {
  try {
    const userData = { ...req.body };

    // Handle profile image upload if provided
    if (req.filesInfo && req.filesInfo.profile_img) {
      userData.profile_img = req.filesInfo.profile_img.secure_url;
    }

    // Handle banner image upload if provided
    if (req.filesInfo && req.filesInfo.banner_url) {
      userData.banner_url = req.filesInfo.banner_url.secure_url;
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update user with image uploads
const updateUser = async (req, res) => {
  try {
    const userData = { ...req.body };

    // Handle profile image upload if provided
    if (req.filesInfo && req.filesInfo.profile_img) {
      userData.profile_img = req.filesInfo.profile_img.secure_url;
    }

    // Handle banner image upload if provided
    if (req.filesInfo && req.filesInfo.banner_url) {
      userData.banner_url = req.filesInfo.banner_url.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.params.id, userData, {
      new: true,
      runValidators: true,
    }).select("-__v");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export default {
  getAllUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};

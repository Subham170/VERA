import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    banner_url: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: "Banner URL must be a valid image URL",
      },
    },
    profile_img: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: "Profile image URL must be a valid image URL",
      },
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot be more than 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot be more than 500 characters"],
    },
    address: {
      type: String,
      trim: true,
      required: [true, "Address is required"],
      unique: true,
      maxlength: [200, "Address cannot be more than 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
// userSchema.index({ username: 1 });
// userSchema.index({ email: 1 });
// userSchema.index({ createdAt: -1 });

export default mongoose.model("User", userSchema);

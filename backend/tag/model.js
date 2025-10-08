import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    img_urls: [{
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
        },
        message: "Image URL must be a valid image URL",
      },
    }],
    video_urls: [{
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(mp4|mov|avi|mkv|webm|flv)$/i.test(v);
        },
        message: "Video URL must be a valid video URL",
      },
    }],
    audio_urls: [{
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(v);
        },
        message: "Audio URL must be a valid audio URL",
      },
    }],
    file_name: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
      maxlength: [255, "File name cannot be more than 255 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    hash_address: {
      type: String,
      required: [true, "Hash address is required"],
      unique: true,
      trim: true,
      maxlength: [200, "Hash address cannot be more than 200 characters"],
    },
    mediacid: {
      type: String,
      required: [true, "Hash address is required"],
      unique: true,
      trim: true,
      maxlength: [200, "Hash address cannot be more than 200 characters"],
    },
    metadatacid: {
      type: String,
      required: [true, "Hash address is required"],
      unique: true,
      trim: true,
      maxlength: [200, "Hash address cannot be more than 200 characters"],
    },
    address: {
      type: String,
      required: [true, "User address is required"],
      trim: true,
      maxlength: [200, "Address cannot be more than 200 characters"],
      ref: "User",
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ["img", "video", "audio"],
        message: "Type must be either 'img', 'video', or 'audio'",
      },
    },
    // Additional metadata
    file_size: {
      type: Number,
      min: [0, "File size cannot be negative"],
    },
    file_count: {
      type: Number,
      default: 1,
      min: [1, "File count must be at least 1"],
    },
    is_bulk_upload: {
      type: Boolean,
      default: false,
    },
    // Status fields
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "rejected"],
      default: "active",
    },
    // View and interaction counts
    view_count: {
      type: Number,
      default: 0,
      min: [0, "View count cannot be negative"],
    },
    like_count: {
      type: Number,
      default: 0,
      min: [0, "Like count cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
tagSchema.index({ address: 1 });
tagSchema.index({ hash_address: 1 });
tagSchema.index({ type: 1 });
tagSchema.index({ status: 1 });
tagSchema.index({ createdAt: -1 });
tagSchema.index({ view_count: -1 });
tagSchema.index({ like_count: -1 });

// Compound indexes for common queries
tagSchema.index({ address: 1, type: 1 });
tagSchema.index({ address: 1, status: 1 });
tagSchema.index({ type: 1, status: 1 });

// Virtual for total media count
tagSchema.virtual("total_media_count").get(function () {
  return (this.img_urls?.length || 0) + 
         (this.video_urls?.length || 0) + 
         (this.audio_urls?.length || 0);
});

// Virtual for primary media URL (first media of the specified type)
tagSchema.virtual("primary_media_url").get(function () {
  switch (this.type) {
    case "img":
      return this.img_urls?.[0] || null;
    case "video":
      return this.video_urls?.[0] || null;
    case "audio":
      return this.audio_urls?.[0] || null;
    default:
      return null;
  }
});

// Ensure virtual fields are serialized
tagSchema.set("toJSON", { virtuals: true });
tagSchema.set("toObject", { virtuals: true });

// Pre-save middleware to validate media URLs based on type
tagSchema.pre("save", function (next) {
  // Validate that at least one media URL exists for the specified type
  let hasValidMedia = false;
  
  switch (this.type) {
    case "img":
      hasValidMedia = this.img_urls && this.img_urls.length > 0;
      break;
    case "video":
      hasValidMedia = this.video_urls && this.video_urls.length > 0;
      break;
    case "audio":
      hasValidMedia = this.audio_urls && this.audio_urls.length > 0;
      break;
  }
  
  if (!hasValidMedia) {
    return next(new Error(`At least one ${this.type} URL is required`));
  }
  
  // Set file_count based on actual media URLs
  this.file_count = this.total_media_count;
  this.is_bulk_upload = this.file_count > 1;
  
  next();
});

// Static method to find tags by user address
tagSchema.statics.findByUserAddress = function (address) {
  return this.find({ address, status: "active" }).sort({ createdAt: -1 });
};

// Static method to find tags by type
tagSchema.statics.findByType = function (type) {
  return this.find({ type, status: "active" }).sort({ createdAt: -1 });
};

// Static method to find popular tags
tagSchema.statics.findPopular = function (limit = 10) {
  return this.find({ status: "active" })
    .sort({ view_count: -1, like_count: -1 })
    .limit(limit);
};

// Instance method to increment view count
tagSchema.methods.incrementViewCount = function () {
  this.view_count += 1;
  return this.save();
};

// Instance method to increment like count
tagSchema.methods.incrementLikeCount = function () {
  this.like_count += 1;
  return this.save();
};

// Instance method to get all media URLs
tagSchema.methods.getAllMediaUrls = function () {
  const allUrls = [];
  if (this.img_urls) allUrls.push(...this.img_urls);
  if (this.video_urls) allUrls.push(...this.video_urls);
  if (this.audio_urls) allUrls.push(...this.audio_urls);
  return allUrls;
};

export default mongoose.model("Tag", tagSchema);

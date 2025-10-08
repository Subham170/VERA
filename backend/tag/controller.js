import Tag from "./model.js";
import { deleteCloudinaryImage } from "../middleware/userUpload.js";

// Create a new tag
export const createTag = async (req, res) => {
  try {
    const {
      file_name,
      description,
      hash_address,
      mediacid,
      metadatacid,
      address,
      type,
      img_urls = [],
      video_urls = [],
      audio_urls = [],
      file_size,
    } = req.body;

    // Validate required fields
    if (!file_name || !hash_address || !address || !type || !mediacid || !metadatacid) {
      return res.status(400).json({
        status: "error",
        message: "file_name, hash_address, address, and type are required",
      });
    }

    // Validate type
    if (!["img", "video", "audio"].includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Type must be 'img', 'video', or 'audio'",
      });
    }

    // Check if tag with this hash_address already exists
    const existingTag = await Tag.findOne({ hash_address });
    if (existingTag) {
      return res.status(409).json({
        status: "error",
        message: "Tag with this hash address already exists",
      });
    }

    // Validate that at least one media URL exists for the specified type
    let hasValidMedia = false;
    switch (type) {
      case "img":
        hasValidMedia = img_urls && img_urls.length > 0;
        break;
      case "video":
        hasValidMedia = video_urls && video_urls.length > 0;
        break;
      case "audio":
        hasValidMedia = audio_urls && audio_urls.length > 0;
        break;
    }

    if (!hasValidMedia) {
      return res.status(400).json({
        status: "error",
        message: `At least one ${type} URL is required`,
      });
    }

    // Create new tag
    const tag = new Tag({
      file_name,
      description,
      hash_address,
      mediacid,
      metadatacid,
      address,
      type,
      img_urls,
      video_urls,
      audio_urls,
      file_size,
    });
    await tag.save();

    res.status(201).json({
      status: "success",
      message: "Tag created successfully",
      data: {
        tag: {
          id: tag._id,
          file_name: tag.file_name,
          description: tag.description,
          hash_address: tag.hash_address,
          metadatacid:tag.metadatacid,
          mediacid:tag.mediacid,
          address: tag.address,
          type: tag.type,
          img_urls: tag.img_urls,
          video_urls: tag.video_urls,
          audio_urls: tag.audio_urls,
          file_size: tag.file_size,
          file_count: tag.file_count,
          is_bulk_upload: tag.is_bulk_upload,
          status: tag.status,
          view_count: tag.view_count,
          like_count: tag.like_count,
          total_media_count: tag.total_media_count,
          primary_media_url: tag.primary_media_url,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    
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
      message: "Failed to create tag",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all tags with pagination and filtering
export const getAllTags = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      address,
      status = "active",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { status };
    if (type) filter.type = type;
    if (address) filter.address = address;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get tags with pagination
    const tags = await Tag.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Tag.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        tags,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch tags",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get tag by ID
export const getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        status: "error",
        message: "Tag not found",
      });
    }

    // Increment view count
    await tag.incrementViewCount();

    res.status(200).json({
      status: "success",
      data: {
        tag: {
          id: tag._id,
          file_name: tag.file_name,
          description: tag.description,
          hash_address: tag.hash_address,
          metadatacid:tag.metadatacid,
          mediacid:tag.mediacid,
          address: tag.address,
          type: tag.type,
          img_urls: tag.img_urls,
          video_urls: tag.video_urls,
          audio_urls: tag.audio_urls,
          file_size: tag.file_size,
          file_count: tag.file_count,
          is_bulk_upload: tag.is_bulk_upload,
          status: tag.status,
          view_count: tag.view_count,
          like_count: tag.like_count,
          total_media_count: tag.total_media_count,
          primary_media_url: tag.primary_media_url,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching tag:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch tag",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get tag by hash address
export const getTagByHash = async (req, res) => {
  try {
    const { hash_address } = req.params;

    const tag = await Tag.findOne({ hash_address });
    if (!tag) {
      return res.status(404).json({
        status: "error",
        message: "Tag not found",
      });
    }

    // Increment view count
    await tag.incrementViewCount();

    res.status(200).json({
      status: "success",
      data: {
        tag: {
          id: tag._id,
          file_name: tag.file_name,
          description: tag.description,
          hash_address: tag.hash_address,
          metadatacid:tag.metadatacid,
          mediacid:tag.mediacid,
          address: tag.address,
          type: tag.type,
          img_urls: tag.img_urls,
          video_urls: tag.video_urls,
          audio_urls: tag.audio_urls,
          file_size: tag.file_size,
          file_count: tag.file_count,
          is_bulk_upload: tag.is_bulk_upload,
          status: tag.status,
          view_count: tag.view_count,
          like_count: tag.like_count,
          total_media_count: tag.total_media_count,
          primary_media_url: tag.primary_media_url,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching tag by hash:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch tag",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get tags by user address
export const getTagsByUser = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 10, type, status = "active" } = req.query;

    // Build filter object
    const filter = { address };
    if (type) filter.type = type;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get tags
    const tags = await Tag.find(filter)

    // Get total count
    const total = await Tag.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        tags,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user tags:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user tags",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update tag by ID
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.hash_address;
    delete updateData.address;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Validate update data
    const allowedFields = [
      "file_name",
      "description",
      "type",
      "img_urls",
      "video_urls",
      "audio_urls",
      "file_size",
      "status",
    ];
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

    // Check if tag exists
    const existingTag = await Tag.findById(id);
    if (!existingTag) {
      return res.status(404).json({
        status: "error",
        message: "Tag not found",
      });
    }

    // Store old media URLs for cleanup
    const oldImgUrls = existingTag.img_urls || [];
    const oldVideoUrls = existingTag.video_urls || [];
    const oldAudioUrls = existingTag.audio_urls || [];

    // Update tag
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    // Clean up old media URLs from Cloudinary if they were replaced
    if (updateFields.img_urls) {
      const newImgUrls = updateFields.img_urls;
      const urlsToDelete = oldImgUrls.filter(url => !newImgUrls.includes(url));
      for (const url of urlsToDelete) {
        await deleteCloudinaryImage(url);
      }
    }

    if (updateFields.video_urls) {
      const newVideoUrls = updateFields.video_urls;
      const urlsToDelete = oldVideoUrls.filter(url => !newVideoUrls.includes(url));
      for (const url of urlsToDelete) {
        await deleteCloudinaryImage(url);
      }
    }

    if (updateFields.audio_urls) {
      const newAudioUrls = updateFields.audio_urls;
      const urlsToDelete = oldAudioUrls.filter(url => !newAudioUrls.includes(url));
      for (const url of urlsToDelete) {
        await deleteCloudinaryImage(url);
      }
    }

    res.status(200).json({
      status: "success",
      message: "Tag updated successfully",
      data: {
        tag: {
          id: updatedTag._id,
          file_name: updatedTag.file_name,
          description: updatedTag.description,
          hash_address: updatedTag.hash_address,
          metadatacid:updatedTag.metadatacid,
          mediacid:updatedTag.mediacid,
          address: updatedTag.address,
          type: updatedTag.type,
          img_urls: updatedTag.img_urls,
          video_urls: updatedTag.video_urls,
          audio_urls: updatedTag.audio_urls,
          file_size: updatedTag.file_size,
          file_count: updatedTag.file_count,
          is_bulk_upload: updatedTag.is_bulk_upload,
          status: updatedTag.status,
          view_count: updatedTag.view_count,
          like_count: updatedTag.like_count,
          total_media_count: updatedTag.total_media_count,
          primary_media_url: updatedTag.primary_media_url,
          createdAt: updatedTag.createdAt,
          updatedAt: updatedTag.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error updating tag:", error);
    
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
      message: "Failed to update tag",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete tag by ID
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        status: "error",
        message: "Tag not found",
      });
    }

    // Clean up all media URLs from Cloudinary
    const allUrls = tag.getAllMediaUrls();
    for (const url of allUrls) {
      await deleteCloudinaryImage(url);
    }

    // Delete tag
    await Tag.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete tag",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Like a tag
export const likeTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        status: "error",
        message: "Tag not found",
      });
    }

    await tag.incrementLikeCount();

    res.status(200).json({
      status: "success",
      message: "Tag liked successfully",
      data: {
        like_count: tag.like_count,
      },
    });
  } catch (error) {
    console.error("Error liking tag:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to like tag",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get popular tags
export const getPopularTags = async (req, res) => {
  try {
    const { limit = 10, type } = req.query;

    const filter = { status: "active" };
    if (type) filter.type = type;

    const tags = await Tag.find(filter)
      .sort({ view_count: -1, like_count: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      status: "success",
      data: {
        tags,
      },
    });
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch popular tags",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

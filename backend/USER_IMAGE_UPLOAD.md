# User Image Upload Guide

This guide explains how to upload profile and banner images for users using Cloudinary integration.

## 🚀 Features

- **Profile Image Upload**: Upload user profile pictures
- **Banner Image Upload**: Upload user banner/cover images
- **Automatic Cloudinary Integration**: Images are automatically uploaded to Cloudinary
- **URL Storage**: Cloudinary URLs are saved in the database
- **Image Validation**: Only valid image formats are accepted
- **Size Limits**: 10MB maximum file size per image

## 📡 API Endpoints

### Create User with Images

```bash
POST /api/users
Content-Type: multipart/form-data

Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "bio": "Software developer",
  "address": "123 Main St, City, Country",
  "profile_img": [image file],
  "banner_url": [image file]
}
```

### Update User with Images

```bash
PUT /api/users/:id
Content-Type: multipart/form-data

Body:
{
  "username": "john_doe_updated",
  "bio": "Updated bio",
  "profile_img": [image file],
  "banner_url": [image file]
}
```

### Update Only Profile Image

```bash
PUT /api/users/:id/profile-image
Content-Type: multipart/form-data

Body:
{
  "profile_img": [image file]
}
```

### Update Only Banner Image

```bash
PUT /api/users/:id/banner-image
Content-Type: multipart/form-data

Body:
{
  "banner_url": [image file]
}
```

## 📝 Request Format

### Form Data Fields

- `username` (string, required): User's username
- `email` (string, required): User's email address
- `bio` (string, optional): User's bio/description
- `address` (string, optional): User's address
- `profile_img` (file, optional): Profile image file
- `banner_url` (file, optional): Banner image file

### Supported Image Formats

- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

### File Size Limits

- **Maximum Size**: 10MB per image
- **Recommended Size**:
  - Profile Image: 400x400px
  - Banner Image: 1200x400px

## 📋 Response Format

### Successful User Creation/Update

```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "bio": "Software developer",
    "address": "123 Main St, City, Country",
    "profile_img": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/vera/users/profile_img.jpg",
    "banner_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/vera/users/banner_url.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Invalid image file type"
}
```

## 🛠️ Usage Examples

### Frontend Upload (JavaScript)

```javascript
// Create user with images
const createUserWithImages = async (userData, profileImage, bannerImage) => {
  const formData = new FormData();

  // Add user data
  formData.append("username", userData.username);
  formData.append("email", userData.email);
  formData.append("bio", userData.bio);
  formData.append("address", userData.address);

  // Add images if provided
  if (profileImage) {
    formData.append("profile_img", profileImage);
  }
  if (bannerImage) {
    formData.append("banner_url", bannerImage);
  }

  const response = await fetch("/api/users", {
    method: "POST",
    body: formData,
  });

  return await response.json();
};

// Update user profile image only
const updateProfileImage = async (userId, profileImage) => {
  const formData = new FormData();
  formData.append("profile_img", profileImage);

  const response = await fetch(`/api/users/${userId}/profile-image`, {
    method: "PUT",
    body: formData,
  });

  return await response.json();
};

// Update user banner image only
const updateBannerImage = async (userId, bannerImage) => {
  const formData = new FormData();
  formData.append("banner_url", bannerImage);

  const response = await fetch(`/api/users/${userId}/banner-image`, {
    method: "PUT",
    body: formData,
  });

  return await response.json();
};
```

### React Component Example

```jsx
import React, { useState } from "react";

const UserForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    address: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await createUserWithImages(
        formData,
        profileImage,
        bannerImage
      );

      if (result.status === "success") {
        console.log("User created:", result.data);
        // Handle success
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <textarea
        placeholder="Bio"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
      />

      <input
        type="text"
        placeholder="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProfileImage(e.target.files[0])}
      />
      <label>Profile Image</label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setBannerImage(e.target.files[0])}
      />
      <label>Banner Image</label>

      <button type="submit">Create User</button>
    </form>
  );
};
```

## 🔒 Security Features

- **File Type Validation**: Only image files are accepted
- **Size Limits**: Maximum 10MB per image
- **Virus Scanning**: Cloudinary provides built-in virus scanning
- **Secure URLs**: All image URLs are HTTPS
- **Access Control**: Images are stored in organized folders

## 📊 Cloudinary Organization

Images are organized in Cloudinary as follows:

```
vera/
└── users/
    ├── profile_img_[timestamp]
    └── banner_url_[timestamp]
```

## 🚨 Error Handling

The system handles various error scenarios:

- **Invalid File Type**: Returns error for non-image files
- **File Too Large**: Returns error for files exceeding 10MB
- **Upload Failure**: Returns error if Cloudinary upload fails
- **Validation Errors**: Returns Mongoose validation errors
- **User Not Found**: Returns 404 for non-existent users

## 🔧 Customization

You can customize the image upload behavior by modifying:

- **File size limits** in `middleware/userUpload.js`
- **Allowed formats** in the file filter
- **Cloudinary folder structure** in storage configuration
- **Image transformations** in Cloudinary params

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

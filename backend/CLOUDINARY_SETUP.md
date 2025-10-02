# Cloudinary Setup Guide

This guide explains how to set up and use Cloudinary for media file uploads in your VERA backend.

## 🚀 Quick Setup

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Get your credentials from the dashboard

### 2. Environment Configuration

Create a `.env` file in your backend root with:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Install Dependencies

```bash
npm install cloudinary multer multer-storage-cloudinary
```

## 📁 File Structure

```
backend/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── middleware/
│   └── upload.js              # Upload middleware
├── utils/
│   └── mediaUtils.js          # Media utility functions
├── media/
│   └── routes.js              # Media upload routes
└── server.js                  # Main server file
```

## 🔧 Supported File Types

### Images

- **Formats:** JPG, JPEG, PNG, GIF, WebP, SVG
- **Size Limit:** 10MB
- **Folder:** `vera/images`

### Videos

- **Formats:** MP4, MOV, AVI, MKV, WebM, FLV
- **Size Limit:** 100MB
- **Folder:** `vera/videos`

### Audio

- **Formats:** MP3, WAV, OGG, AAC, FLAC, M4A
- **Size Limit:** 50MB
- **Folder:** `vera/audio`

### Documents

- **Formats:** PDF, DOC, DOCX, TXT, RTF
- **Size Limit:** 20MB
- **Folder:** `vera/documents`

## 📡 API Endpoints

### Single File Uploads

```bash
# Upload single image
POST /api/media/upload/image
Content-Type: multipart/form-data
Body: { image: file }

# Upload single video
POST /api/media/upload/video
Content-Type: multipart/form-data
Body: { video: file }

# Upload single audio
POST /api/media/upload/audio
Content-Type: multipart/form-data
Body: { audio: file }

# Upload single document
POST /api/media/upload/document
Content-Type: multipart/form-data
Body: { document: file }

# Upload any file type
POST /api/media/upload/file
Content-Type: multipart/form-data
Body: { file: file }
```

### Multiple File Uploads

```bash
# Upload multiple images
POST /api/media/upload/images
Content-Type: multipart/form-data
Body: { images: [file1, file2, ...] }

# Upload multiple videos
POST /api/media/upload/videos
Content-Type: multipart/form-data
Body: { videos: [file1, file2, ...] }

# Upload multiple audio files
POST /api/media/upload/audio
Content-Type: multipart/form-data
Body: { audio: [file1, file2, ...] }

# Upload multiple documents
POST /api/media/upload/documents
Content-Type: multipart/form-data
Body: { documents: [file1, file2, ...] }

# Upload multiple files of any type
POST /api/media/upload/files
Content-Type: multipart/form-data
Body: { files: [file1, file2, ...] }
```

### Mixed File Upload

```bash
# Upload mixed file types
POST /api/media/upload/mixed
Content-Type: multipart/form-data
Body: {
  images: [file1, file2],
  videos: [file3],
  audio: [file4, file5],
  documents: [file6]
}
```

### File Management

```bash
# Delete file
DELETE /api/media/delete/:publicId?resourceType=auto

# Get file info
GET /api/media/info/:publicId?resourceType=auto

# Get optimized URL
GET /api/media/optimized/:publicId?width=800&height=600&crop=fill

# Get thumbnail
GET /api/media/thumbnail/:publicId?width=300&height=300
```

## 📝 Response Format

### Successful Upload Response

```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "public_id": "vera/images/sample_image",
    "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/vera/images/sample_image.jpg",
    "url": "http://res.cloudinary.com/your-cloud/image/upload/v1234567890/vera/images/sample_image.jpg",
    "format": "jpg",
    "resource_type": "image",
    "bytes": 245760,
    "width": 1920,
    "height": 1080,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Multiple Files Response

```json
{
  "status": "success",
  "message": "Images uploaded successfully",
  "count": 3,
  "data": [
    {
      "public_id": "vera/images/image1",
      "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/vera/images/image1.jpg",
      "format": "jpg",
      "resource_type": "image",
      "bytes": 245760,
      "width": 1920,
      "height": 1080
    }
    // ... more files
  ]
}
```

## 🛠️ Usage Examples

### Frontend Upload (JavaScript)

```javascript
// Single image upload
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/media/upload/image", {
    method: "POST",
    body: formData,
  });

  return await response.json();
};

// Multiple files upload
const uploadMultipleFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch("/api/media/upload/files", {
    method: "POST",
    body: formData,
  });

  return await response.json();
};
```

### Using in Controllers

```javascript
import { mediaUtils } from "../utils/mediaUtils.js";

// Upload from buffer
const uploadFromBuffer = async (buffer) => {
  try {
    const result = await mediaUtils.uploadFromBuffer(buffer, {
      folder: "custom-folder",
    });
    return result;
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Delete file
const deleteFile = async (publicId) => {
  try {
    const result = await mediaUtils.deleteFile(publicId);
    return result;
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};
```

## 🔒 Security Features

- **File Type Validation:** Only allowed file types are accepted
- **Size Limits:** Different limits for different file types
- **Virus Scanning:** Cloudinary provides built-in virus scanning
- **Secure URLs:** All URLs are HTTPS by default
- **Access Control:** Files are private by default

## 📊 Performance Optimizations

- **Auto Quality:** Automatic quality optimization
- **Auto Format:** Automatic format selection (WebP, AVIF)
- **Progressive Loading:** Progressive JPEG for images
- **Lazy Loading:** On-demand transformation
- **CDN Delivery:** Global CDN for fast delivery

## 🚨 Error Handling

The system includes comprehensive error handling for:

- File size exceeded
- Invalid file type
- Upload failures
- Network errors
- Cloudinary API errors

## 📈 Monitoring

Cloudinary provides detailed analytics including:

- Bandwidth usage
- Storage usage
- Transformation usage
- API calls
- Error rates

## 🔧 Customization

You can customize the setup by modifying:

- File size limits in `config/cloudinary.js`
- Allowed file types in middleware
- Folder structure
- Transformation options
- Quality settings

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)

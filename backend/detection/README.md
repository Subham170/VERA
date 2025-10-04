# Detection Module

A comprehensive deepfake detection module for the VERA backend API. This module handles file uploads, Cloudinary integration, and AI-powered deepfake detection.

## 📁 Structure

```
detection/
├── controllers/
│   └── detectionController.js    # Main controller with business logic
├── routes/
│   └── detectionRoutes.js        # Express routes definition
├── utils/
│   ├── mediaUtils.js             # Media type detection and validation
│   ├── cloudinaryUtils.js        # Cloudinary upload/management utilities
│   └── aiUtils.js                # OpenAI API integration utilities
├── middleware/
│   └── uploadMiddleware.js       # File upload middleware
├── index.js                      # Module exports
└── README.md                     # This file
```

## 🚀 Features

### Core Functionality
- **File Upload Processing**: Handles multipart form data uploads
- **Cloudinary Integration**: Automatic file upload to Cloudinary CDN
- **AI Detection**: OpenAI-powered deepfake detection
- **Multiple Input Types**: Supports files, image URLs, and text
- **Comprehensive Error Handling**: Robust error management and cleanup

### Supported Media Types
- **Images**: JPG, JPEG, PNG, GIF, WebP, BMP, SVG
- **Videos**: MP4, MOV, AVI, MKV, WebM, FLV
- **Audio**: MP3, WAV, OGG, AAC, FLAC, M4A
- **Documents**: PDF, TXT

### API Endpoints

#### POST `/api/detect`
Main detection endpoint that accepts:
- **File Upload**: `multipart/form-data` with `file_data` field
- **Image URL**: JSON body with `image_url` field
- **Text Input**: JSON body with `text` field

**Response Format:**
```json
{
  "media_type": "image",
  "deepfake_probability": 15,
  "natural_probability": 85,
  "reasoning": {
    "content_analysis": "High-quality portrait photograph",
    "deepfake_indicators": "No obvious signs of manipulation",
    "authentic_indicators": "Natural skin texture, consistent lighting",
    "overall": "Image appears to be authentic"
  },
  "raw_model_output": "...",
  "sdk_raw": {...},
  "provided_source": "uploaded file (mimetype=image/jpeg)",
  "cloudinary_url": "https://res.cloudinary.com/...",
  "cloudinary_public_id": "vera/detection/images/abc123"
}
```

#### GET `/api/detect/health`
Health check endpoint for the detection service.

#### GET `/api/detect/supported-types`
Returns supported file types and upload limits.

## 🛠️ Usage

### Basic File Upload
```javascript
const formData = new FormData();
formData.append('file_data', fileInput.files[0]);

fetch('/api/detect', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Image URL Detection
```javascript
fetch('/api/detect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image_url: 'https://example.com/image.jpg'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Text Analysis
```javascript
fetch('/api/detect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'This is a text input for analysis'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🔧 Configuration

### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### File Upload Limits
- **Maximum file size**: 100MB
- **Maximum files per request**: 5
- **Supported formats**: See supported media types above

## 📋 Error Handling

The module provides comprehensive error handling:

### File Upload Errors
- `file_too_large`: File exceeds 100MB limit
- `too_many_files`: More than 5 files uploaded
- `unsupported_file_type`: File type not supported
- `unexpected_file_field`: Wrong field name used

### Processing Errors
- `invalid_image_url`: Invalid or unsupported image URL
- `no_input`: No valid input provided
- `internal_error`: Server-side processing error

### Cloudinary Errors
- Automatic cleanup of failed uploads
- Detailed error logging
- Graceful degradation

## 🔄 Processing Flow

1. **Input Validation**: Validate file type, size, and format
2. **Temporary Storage**: Store file temporarily for processing
3. **Cloudinary Upload**: Upload to Cloudinary with proper organization
4. **AI Processing**: Send Cloudinary URL to OpenAI for analysis
5. **Response Formatting**: Normalize and structure the response
6. **Cleanup**: Remove temporary files and handle errors

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/detect/health
```

### File Upload Test
```bash
curl -X POST http://localhost:5000/api/detect \
  -F "file_data=@test-image.jpg"
```

### Supported Types Check
```bash
curl http://localhost:5000/api/detect/supported-types
```

## 🔒 Security Features

- **File Type Validation**: Strict MIME type checking
- **Size Limits**: Prevents oversized file uploads
- **Input Sanitization**: Validates all input parameters
- **Error Handling**: Prevents information leakage
- **Resource Cleanup**: Automatic cleanup of temporary files

## 📊 Performance

- **CDN Delivery**: Cloudinary provides global CDN
- **Automatic Optimization**: Images and videos are optimized
- **Efficient Processing**: Streamlined upload and detection pipeline
- **Resource Management**: Proper cleanup prevents memory leaks

## 🚨 Troubleshooting

### Common Issues

1. **OpenAI API Key Missing**
   - Ensure `OPENAI_API_KEY` is set in environment variables
   - Check the health endpoint for configuration status

2. **Cloudinary Configuration Issues**
   - Verify all Cloudinary environment variables are set
   - Check Cloudinary dashboard for upload limits

3. **File Upload Failures**
   - Verify file type is supported
   - Check file size is under 100MB limit
   - Ensure proper field name (`file_data`) is used

4. **Detection Errors**
   - Check OpenAI API quota and limits
   - Verify model availability
   - Review error logs for detailed information

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in your environment variables.

## 📈 Monitoring

The module provides several monitoring endpoints:
- Health check for service status
- Supported types for client validation
- Detailed error responses for debugging
- Cloudinary resource tracking

## 🔄 Maintenance

### Regular Tasks
- Monitor Cloudinary storage usage
- Review OpenAI API usage and costs
- Clean up old temporary files
- Update supported file types as needed

### Updates
- Keep OpenAI SDK updated
- Monitor Cloudinary API changes
- Update file type support as needed
- Review and update error handling

# Detection API Improvements

## Overview
The `/detect` API endpoint has been completely refactored to properly handle file uploads by first uploading them to Cloudinary, then using the Cloudinary URL for AI detection. This approach provides better performance, reliability, and scalability.

## Key Improvements

### 1. Cloudinary Integration
- **File Upload**: All uploaded files are now uploaded to Cloudinary first before processing
- **Organized Storage**: Files are organized in folders by media type (`vera/detection/images`, `vera/detection/videos`, etc.)
- **Optimized URLs**: Cloudinary provides optimized, CDN-delivered URLs for better performance
- **Automatic Cleanup**: Failed uploads are automatically cleaned up from Cloudinary

### 2. Enhanced Error Handling
- **Comprehensive Validation**: Better validation for image URLs and file types
- **Graceful Degradation**: Proper error responses with meaningful messages
- **Resource Cleanup**: Automatic cleanup of temporary files and Cloudinary resources on errors
- **Detailed Logging**: Enhanced error logging for debugging

### 3. Improved Media Type Detection
- **MIME-based Detection**: More accurate media type detection based on MIME types
- **Cloudinary Integration**: Media types are determined before and after Cloudinary upload
- **Fallback Handling**: Proper fallback for unknown media types

### 4. Better API Response
- **Cloudinary Metadata**: Response now includes Cloudinary URL and public ID
- **Enhanced Debugging**: More detailed information for debugging and monitoring
- **Consistent Structure**: Standardized response format across all input types

## API Usage

### File Upload (Multipart Form Data)
```bash
curl -X POST http://localhost:5000/detect \
  -F "file_data=@/path/to/image.jpg"
```

### Image URL (JSON)
```bash
curl -X POST http://localhost:5000/detect \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/image.jpg"}'
```

### Text Input (JSON)
```bash
curl -X POST http://localhost:5000/detect \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a text input for analysis"}'
```

## Response Format

```json
{
  "media_type": "image",
  "deepfake_probability": 15,
  "natural_probability": 85,
  "reasoning": {
    "content_analysis": "High-quality portrait photograph with natural lighting",
    "deepfake_indicators": "No obvious signs of manipulation detected",
    "authentic_indicators": "Natural skin texture, consistent lighting, realistic facial features",
    "overall": "Image appears to be authentic based on technical analysis"
  },
  "raw_model_output": "...",
  "sdk_raw": {...},
  "provided_source": "uploaded file (mimetype=image/jpeg)",
  "cloudinary_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/vera/detection/images/abc123.jpg",
  "cloudinary_public_id": "vera/detection/images/abc123"
}
```

## Technical Details

### File Processing Flow
1. **Temporary Upload**: File is uploaded to temporary local storage
2. **Cloudinary Upload**: File is uploaded to Cloudinary with appropriate settings
3. **AI Processing**: Cloudinary URL is used for AI detection
4. **Cleanup**: Temporary file is removed, Cloudinary resource is kept for future reference

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF, WebP, BMP, SVG
- **Videos**: MP4, MOV, AVI, MKV, WebM, FLV
- **Audio**: MP3, WAV, OGG, AAC, FLAC, M4A
- **Documents**: PDF, DOC, DOCX, TXT, RTF

### Error Handling
- **Invalid File Types**: Returns 400 with specific error message
- **Upload Failures**: Returns 500 with detailed error information
- **Cloudinary Errors**: Automatic cleanup and error reporting
- **AI Processing Errors**: Graceful fallback with partial results

## Environment Variables Required

```env
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Benefits

1. **Performance**: CDN-delivered URLs provide faster access to media files
2. **Reliability**: Cloudinary handles file storage, optimization, and delivery
3. **Scalability**: No local storage limitations, better resource management
4. **Security**: Files are stored securely in Cloudinary with proper access controls
5. **Monitoring**: Better tracking of file uploads and processing
6. **Cost Efficiency**: Reduced server storage and bandwidth usage

## Migration Notes

- The API maintains backward compatibility with existing clients
- Response format is enhanced but not breaking
- All existing functionality is preserved
- New Cloudinary metadata is optional and doesn't affect existing integrations

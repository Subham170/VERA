// Utility functions for media type detection and validation

/**
 * Determine media type from MIME type
 * @param {string} mimeType - The MIME type of the file
 * @returns {string} - The detected media type (image, video, audio, unknown)
 */
export function getMediaTypeFromMime(mimeType) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "unknown";
}

/**
 * Validate if a URL is a valid image URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid image URL, false otherwise
 */
export function isValidImageUrl(url) {
  try {
    const urlObj = new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(urlObj.pathname);
  } catch {
    return false;
  }
}

/**
 * Basic sanity check for image URL (legacy function)
 * @param {string} url - The URL to check
 * @returns {boolean} - True if likely an image URL
 */
export function isLikelyImageUrl(url) {
  return typeof url === "string" && /^https?:\/\/.+\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(url);
}

/**
 * Get file extension from filename
 * @param {string} filename - The filename
 * @returns {string} - The file extension (without dot)
 */
export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Check if file type is supported for detection
 * @param {string} mimeType - The MIME type
 * @returns {boolean} - True if supported
 */
export function isSupportedFileType(mimeType) {
  const supportedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml',
    // Videos
    'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm', 'video/flv',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/mp4',
    // Documents
    'application/pdf', 'text/plain'
  ];
  
  return supportedTypes.includes(mimeType);
}

/**
 * Get Cloudinary resource type based on media type
 * @param {string} mediaType - The media type (image, video, audio, etc.)
 * @returns {string} - The Cloudinary resource type
 */
export function getCloudinaryResourceType(mediaType) {
  switch (mediaType) {
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'audio':
      return 'raw';
    default:
      return 'raw';
  }
}

/**
 * Generate Cloudinary folder path based on media type
 * @param {string} mediaType - The media type
 * @returns {string} - The folder path
 */
export function getCloudinaryFolder(mediaType) {
  return `vera/detection/${mediaType}s`;
}

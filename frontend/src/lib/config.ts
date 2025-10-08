// Backend API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// API endpoints
export const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/api/users`,
  TAGS: `${API_BASE_URL}/api/tags`,
  TAGS_WITH_IMAGES: `${API_BASE_URL}/api/tags/with-images`,
  TAGS_WITH_VIDEOS: `${API_BASE_URL}/api/tags/with-videos`,
  TAGS_WITH_AUDIO: `${API_BASE_URL}/api/tags/with-audio`,
  TAGS_USER: (address: string) => `${API_BASE_URL}/api/tags/user/${address}`,
} as const;

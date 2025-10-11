// Backend API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// API endpoints
export const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/api/users`,
  TAGS: `${API_BASE_URL}/api/tags`,
  TAG_BY_ID: (id: string) => `${API_BASE_URL}/api/tags/${id}`,
  TAGS_WITH_IMAGES: `${API_BASE_URL}/api/tags/with-images`,
  TAGS_WITH_VIDEOS: `${API_BASE_URL}/api/tags/with-videos`,
  TAGS_WITH_AUDIO: `${API_BASE_URL}/api/tags/with-audio`,
  TAGS_USER: (address: string) => `${API_BASE_URL}/api/tags/user/${address}`,
} as const;

export const NEXT_PUBLIC_PINATA_GATEWAY_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL;
export const NEXT_PUBLIC_PINATA_GATEWAY_TOKEN =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;
export const NEXT_PUBLIC_PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
export const NEXT_PUBLIC_WATERMARK_URL = process.env.NEXT_PUBLIC_WATERMARK_URL;

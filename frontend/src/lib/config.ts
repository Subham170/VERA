// Backend API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000" ;

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

export const NEXT_PUBLIC_PINATA_GATEWAY_URL= "https://lavender-nearby-goldfish-461.mypinata.cloud"
export const NEXT_PUBLIC_PINATA_GATEWAY_TOKEN= "wh4zS7o7k4_1vx0BC2rBAkssjFwZ1dAe1IstDLBlfYuHUFOMMzuW_vWY5gyBvLM-"
export const NEXT_PUBLIC_PINATA_JWT= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYWQ4ZTFkMC0xYzEwLTRlODYtYjQ5MS04ZDE3NmNlZTIwMTciLCJlbWFpbCI6InRlY2hub3RvcGljczIwMDRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImNkYjcxNWYzMDlkZGQ1NGQxM2IzIiwic2NvcGVkS2V5U2VjcmV0IjoiZTdmNzkyYWZkNDdlMGY5Nzc4NDBjODM2OTZiNjg3ZWZhNjJlYWEzNzA5OTZhZDRhODUzMWZiZjkzNmRhYjcwOSIsImV4cCI6MTc5MTY3MjQ5NH0.Z1gHTbV5jPnvLzPB_utXp3hGizBqBp1ZkFymo-BvB0A"
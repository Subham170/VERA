/**
 * Utility functions for managing localStorage with quota handling
 */

export interface StorageOptions {
  fallbackToSession?: boolean;
  compressData?: boolean;
  maxRetries?: number;
}

/**
 * Safely stores data in localStorage with quota error handling
 * @param key - The localStorage key
 * @param data - The data to store
 * @param options - Storage options
 * @returns Promise<boolean> - Whether storage was successful
 */
export async function safeLocalStorageSet(
  key: string,
  data: any,
  options: StorageOptions = {}
): Promise<boolean> {
  const {
    fallbackToSession = true,
    compressData = true,
    maxRetries = 2
  } = options;

  const dataString = JSON.stringify(data);
  
  // Check if data is too large (rough estimate)
  if (dataString.length > 5 * 1024 * 1024) { // 5MB limit
    console.warn(`Data size (${Math.round(dataString.length / 1024 / 1024)}MB) may exceed localStorage quota`);
  }

  // Try localStorage first
  try {
    localStorage.setItem(key, dataString);
    return true;
  } catch (error) {
    console.warn(`localStorage quota exceeded for key "${key}":`, error);
    
    if (compressData && maxRetries > 0) {
      // Try with compressed data
      const compressedData = compressDataForStorage(data);
      try {
        localStorage.setItem(key, JSON.stringify(compressedData));
        return true;
      } catch (compressedError) {
        console.warn(`Compressed data still too large:`, compressedError);
      }
    }
    
    if (fallbackToSession) {
      // Try sessionStorage as fallback
      try {
        sessionStorage.setItem(key, dataString);
        console.log(`Stored in sessionStorage as fallback for key "${key}"`);
        return true;
      } catch (sessionError) {
        console.error(`Both localStorage and sessionStorage failed for key "${key}":`, sessionError);
        return false;
      }
    }
    
    return false;
  }
}

/**
 * Compresses data by removing large fields and optimizing structure
 * @param data - The data to compress
 * @returns Compressed data
 */
function compressDataForStorage(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => compressDataForStorage(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const compressed: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Skip large fields that are not essential
      if (key === 'filePreview' || key === 'base64Preview' || key === 'preview') {
        continue;
      }
      
      // Compress nested objects
      if (typeof value === 'object' && value !== null) {
        compressed[key] = compressDataForStorage(value);
      } else {
        compressed[key] = value;
      }
    }
    
    return compressed;
  }
  
  return data;
}

/**
 * Gets data from localStorage with fallback to sessionStorage
 * @param key - The storage key
 * @returns The stored data or null
 */
export function safeLocalStorageGet(key: string): any {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn(`Error reading from localStorage for key "${key}":`, error);
  }
  
  // Try sessionStorage as fallback
  try {
    const data = sessionStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn(`Error reading from sessionStorage for key "${key}":`, error);
  }
  
  return null;
}

/**
 * Clears storage for a specific key from both localStorage and sessionStorage
 * @param key - The storage key to clear
 */
export function clearStorageKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error clearing localStorage key "${key}":`, error);
  }
  
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error clearing sessionStorage key "${key}":`, error);
  }
}

/**
 * Gets the approximate size of data in bytes
 * @param data - The data to measure
 * @returns Size in bytes
 */
export function getDataSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size;
}

/**
 * Checks if localStorage is available and has space
 * @returns Object with availability and space info
 */
export function checkStorageAvailability(): {
  localStorageAvailable: boolean;
  sessionStorageAvailable: boolean;
  estimatedQuota: number;
} {
  const result = {
    localStorageAvailable: false,
    sessionStorageAvailable: false,
    estimatedQuota: 0
  };
  
  try {
    localStorage.setItem('__quota_test__', 'test');
    localStorage.removeItem('__quota_test__');
    result.localStorageAvailable = true;
  } catch (error) {
    console.warn('localStorage not available:', error);
  }
  
  try {
    sessionStorage.setItem('__quota_test__', 'test');
    sessionStorage.removeItem('__quota_test__');
    result.sessionStorageAvailable = true;
  } catch (error) {
    console.warn('sessionStorage not available:', error);
  }
  
  // Estimate quota (browsers typically allow 5-10MB)
  result.estimatedQuota = 5 * 1024 * 1024; // 5MB conservative estimate
  
  return result;
}

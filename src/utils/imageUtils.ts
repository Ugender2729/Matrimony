/**
 * Image compression and utility functions
 * Compresses images to reduce localStorage size
 */

export interface CompressedImage {
  data: string; // base64 data URL
  size: number; // size in bytes
  originalSize: number; // original size in bytes
}

/**
 * Compress an image file to reduce its size
 * Automatically adjusts compression based on file size
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default: auto-calculated)
 * @param maxHeight - Maximum height (default: auto-calculated)
 * @param quality - JPEG quality 0-1 (default: auto-calculated)
 * @param targetSizeKB - Target file size in KB (default: 500KB)
 * @returns Promise with compressed image data URL
 */
export const compressImage = (
  file: File,
  maxWidth?: number,
  maxHeight?: number,
  quality?: number,
  targetSizeKB: number = 500
): Promise<CompressedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Auto-calculate dimensions and quality based on file size
        const fileSizeMB = file.size / (1024 * 1024);
        
        // Determine max dimensions based on file size
        let calculatedMaxWidth = maxWidth;
        let calculatedMaxHeight = maxHeight;
        let calculatedQuality = quality;
        
        if (!calculatedMaxWidth || !calculatedMaxHeight) {
          if (fileSizeMB > 3) {
            // Very large files (>3MB): compress more aggressively
            calculatedMaxWidth = calculatedMaxWidth || 1200;
            calculatedMaxHeight = calculatedMaxHeight || 1200;
            calculatedQuality = calculatedQuality || 0.6;
          } else if (fileSizeMB > 1) {
            // Large files (1-3MB): moderate compression
            calculatedMaxWidth = calculatedMaxWidth || 1000;
            calculatedMaxHeight = calculatedMaxHeight || 1000;
            calculatedQuality = calculatedQuality || 0.7;
          } else {
            // Smaller files (<1MB): light compression
            calculatedMaxWidth = calculatedMaxWidth || 1200;
            calculatedMaxHeight = calculatedMaxHeight || 1200;
            calculatedQuality = calculatedQuality || 0.8;
          }
        } else {
          calculatedQuality = calculatedQuality || 0.75;
        }
        
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > calculatedMaxWidth || height > calculatedMaxHeight) {
          if (width > height) {
            height = (height * calculatedMaxWidth) / width;
            width = calculatedMaxWidth;
          } else {
            width = (width * calculatedMaxHeight) / height;
            height = calculatedMaxHeight;
          }
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Improve image quality during resize
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Progressive compression: try to get close to target size
        const compressWithQuality = (q: number): string => {
          return canvas.toDataURL('image/jpeg', q);
        };
        
        // Start with calculated quality
        let compressedDataUrl = compressWithQuality(calculatedQuality);
        let currentSizeKB = (compressedDataUrl.length * 3) / 4 / 1024; // Approximate base64 to binary size
        
        // If still too large, reduce quality progressively
        if (currentSizeKB > targetSizeKB && calculatedQuality > 0.3) {
          let testQuality = calculatedQuality;
          const step = 0.1;
          
          while (currentSizeKB > targetSizeKB && testQuality > 0.3) {
            testQuality = Math.max(0.3, testQuality - step);
            compressedDataUrl = compressWithQuality(testQuality);
            currentSizeKB = (compressedDataUrl.length * 3) / 4 / 1024;
          }
        }
        
        resolve({
          data: compressedDataUrl,
          size: compressedDataUrl.length,
          originalSize: file.size,
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB (default: 20MB - since we compress and use Supabase Storage)
 * @returns Error message or null if valid
 */
export const validateImage = (file: File, maxSizeMB: number = 20): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Please select a valid image file';
  }
  
  // Check file size (increased limit since we compress and use Supabase Storage)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Image size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB. The image will be automatically compressed before upload.`;
  }
  
  return null;
};

/**
 * Safe localStorage set with error handling
 * @param key - Storage key
 * @param value - Value to store
 * @throws Error if storage quota is exceeded
 */
export const safeLocalStorageSet = (key: string, value: any): void => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    // Check size before storing (localStorage limit is typically 5-10MB)
    const sizeInBytes = new Blob([stringValue]).size;
    const sizeInMB = sizeInBytes / 1024 / 1024;
    
    if (sizeInMB > 4) {
      throw new Error(
        `Data too large to store (${sizeInMB.toFixed(2)}MB). ` +
        `Please compress images or use a backend for file storage.`
      );
    }
    
    localStorage.setItem(key, stringValue);
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      throw new Error(
        'Storage quota exceeded. Large images cannot be stored in browser storage. ' +
        'Please compress images or connect to a backend for file storage.'
      );
    }
    throw error;
  }
};


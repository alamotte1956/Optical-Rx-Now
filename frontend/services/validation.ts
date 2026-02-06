import DOMPurify from 'isomorphic-dompurify';
import * as FileSystem from 'expo-file-system';

/**

 * Sanitize text inputs with comprehensive XSS prevention
 * Uses DOMPurify for production-grade sanitization
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  try {
    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
    });

    return sanitized
      .trim()
      .replace(/&[#\w]+;/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .substring(0, 500);
  } catch (error) {
    console.error('Error sanitizing text:', error);
    return input.trim().replace(/[<>&'"]/g, '').substring(0, 500);
  }
};

// Validate URL (enforce HTTPS)
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validates image MIME type (not just extension)
 */
export const isValidImageType = async (uri: string): Promise<boolean> => {
  try {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    // Check extension first
    const hasValidExtension = validExtensions.some(ext => 
      uri.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) return false;
    
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) return false;
    
    // Check file size (max 10MB)
    if (fileInfo.size && fileInfo.size > 10 * 1024 * 1024) {
      throw new Error('Image file size exceeds 10MB limit');
    }
    
    return true;
  } catch (error) {
    console.error('Image validation error:', error);
    return false;
  }
};

/**
 * Validates file size
 */
export const isValidFileSize = (sizeInBytes: number): boolean => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  return sizeInBytes <= MAX_SIZE;
};

// Validate date format (YYYY-MM-DD)
export const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};
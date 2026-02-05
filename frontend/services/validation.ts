import DOMPurify from 'isomorphic-dompurify';

/**npm install isomorphic-dompurify --legacy-peer-deps

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

// Validate image type
export const isValidImageType = (uri: string): boolean => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const lowerUri = uri.toLowerCase();
  return validExtensions.some(ext => lowerUri.endsWith(ext));
};

// Validate date format (YYYY-MM-DD)
export const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};
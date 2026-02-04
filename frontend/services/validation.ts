// Sanitize text inputs (basic XSS prevention)
// Note: This provides basic protection by removing angle brackets
// For HTML rendering contexts, use a proper HTML sanitization library
export const sanitizeText = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 500); // Limit length
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

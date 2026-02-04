// Sanitize text inputs (prevent XSS)
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
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const lowerUri = uri.toLowerCase();
  return validTypes.some(type => lowerUri.includes(type));
};

// Validate date format (YYYY-MM-DD)
export const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

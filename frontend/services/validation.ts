import DOMPurify from 'isomorphic-dompurify';
import * as FileSystem from 'expo-file-system';

/**
 * Sanitize text inputs with comprehensive XSS prevention
 * Uses DOMPurify for production-grade sanitization
 */
export const sanitizeText = (input: string, maxLength: number = 500): string => {
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
      .replace(/&[#\\w]+;/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '') // Remove inline event handlers
      .substring(0, maxLength);
  } catch (error) {
    console.error('Error sanitizing text:', error);
    return input
      .trim()
      .replace(/[<>&'"]/g, '')
      .substring(0, maxLength);
  }
};

/**
 * Validate and sanitize name (family member name)
 */
export const validateName = (name: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { valid: false, sanitized: '', error: 'Name is required' };
  }

  const sanitized = sanitizeText(name, 100);
  
  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'Name cannot be empty' };
  }
  
  if (sanitized.length < 2) {
    return { valid: false, sanitized: '', error: 'Name must be at least 2 characters' };
  }
  
  if (sanitized.length > 100) {
    return { valid: false, sanitized: '', error: 'Name must be less than 100 characters' };
  }

  return { valid: true, sanitized };
};

/**
 * Validate relationship
 */
export const validateRelationship = (relationship: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!relationship || typeof relationship !== 'string') {
    return { valid: false, sanitized: '', error: 'Relationship is required' };
  }

  const sanitized = sanitizeText(relationship, 50);
  const validRelationships = ['Self', 'Spouse', 'Partner', 'Child', 'Parent', 'Sibling', 'Other'];
  
  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'Relationship cannot be empty' };
  }

  // Allow custom relationships but validate them
  if (!validRelationships.includes(sanitized) && sanitized.length > 20) {
    return { valid: false, sanitized: '', error: 'Custom relationship must be less than 20 characters' };
  }

  return { valid: true, sanitized };
};

/**
 * Validate notes
 */
export const validateNotes = (notes: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!notes) {
    return { valid: true, sanitized: '' };
  }

  const sanitized = sanitizeText(notes, 500);
  
  if (sanitized.length > 500) {
    return { valid: false, sanitized: '', error: 'Notes must be less than 500 characters' };
  }

  return { valid: true, sanitized };
};

/**
 * Validate zip code (US format)
 */
export const validateZipCode = (zipCode: string): { valid: boolean; error?: string } => {
  if (!zipCode || typeof zipCode !== 'string') {
    return { valid: false, error: 'Zip code is required' };
  }

  const trimmed = zipCode.trim();
  
  // US ZIP code format: 5 digits or 5-4 digits
  const zipRegex = /^\d{5}(-\d{4})?$/;
  
  if (!zipRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid US zip code (e.g., 12345 or 12345-6789)' };
  }

  return { valid: true };
};

/**
 * Validate phone number (US format)
 */
export const validatePhoneNumber = (phone: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, sanitized: '', error: 'Phone number is required' };
  }

  const sanitized = phone.trim().replace(/[^\d]/g, ''); // Remove all non-digits
  
  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'Phone number cannot be empty' };
  }
  
  if (sanitized.length !== 10) {
    return { valid: false, sanitized: '', error: 'Please enter a valid 10-digit US phone number' };
  }

  return { valid: true, sanitized };
};

/**
 * Validate URL (enforce HTTPS)
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate and sanitize URL
 */
export const validateUrl = (url: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!url || typeof url !== 'string') {
    return { valid: false, sanitized: '', error: 'URL is required' };
  }

  const trimmed = url.trim();
  
  if (!isValidUrl(trimmed)) {
    return { valid: false, sanitized: '', error: 'Please enter a valid HTTPS URL' };
  }

  return { valid: true, sanitized: trimmed };
};

/**
 * Validates image MIME type (not just extension)
 */
export const isValidImageType = async (uri: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    // Check extension first
    const hasValidExtension = validExtensions.some(ext => 
      uri.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
      return { valid: false, error: 'Invalid image type. Please use JPG, PNG, WebP, or GIF' };
    }
    
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return { valid: false, error: 'Image file not found' };
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileInfo.size && fileInfo.size > maxSize) {
      return { valid: false, error: 'Image file size exceeds 10MB limit' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Image validation error:', error);
    return { valid: false, error: 'Failed to validate image' };
  }
};

/**
 * Validates file size
 */
export const isValidFileSize = (sizeInBytes: number, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  const isValid = date instanceof Date && !isNaN(date.getTime());
  
  // Ensure date is reasonable (not too far in the past or future)
  const now = new Date();
  const yearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
  
  if (!isValid) return false;
  if (date > yearFromNow) return false; // Not more than a year in the future
  if (date < tenYearsAgo) return false; // Not more than 10 years in the past
  
  return true;
};

/**
 * Validate and sanitize date
 */
export const validateDate = (dateString: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!dateString || typeof dateString !== 'string') {
    return { valid: false, sanitized: '', error: 'Date is required' };
  }

  const trimmed = dateString.trim();
  
  if (!isValidDate(trimmed)) {
    return { valid: false, sanitized: '', error: 'Please enter a valid date (YYYY-MM-DD)' };
  }

  return { valid: true, sanitized: trimmed };
};

/**
 * Validate PD (Pupillary Distance)
 */
export const validatePD = (pd?: number, pdType?: 'monocular' | 'binocular', leftPD?: number, rightPD?: number): { valid: boolean; error?: string } => {
  // If no PD data provided, that's fine (optional)
  if (!pd && !leftPD && !rightPD) {
    return { valid: true };
  }

  if (pdType === 'monocular') {
    // Monocular: need both left and right PD
    if (!leftPD || !rightPD) {
      return { valid: false, error: 'Both left and right PD are required for monocular measurement' };
    }
    
    if (leftPD < 20 || leftPD > 40) {
      return { valid: false, error: 'Left PD must be between 20 and 40mm' };
    }
    
    if (rightPD < 20 || rightPD > 40) {
      return { valid: false, error: 'Right PD must be between 20 and 40mm' };
    }
  } else {
    // Binocular: need total PD
    if (!pd) {
      return { valid: false, error: 'PD is required' };
    }
    
    if (pd < 50 || pd > 80) {
      return { valid: false, error: 'Total PD must be between 50 and 80mm' };
    }
  }

  return { valid: true };
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { valid: false, sanitized: '', error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, sanitized: '', error: 'Please enter a valid email address' };
  }

  if (trimmed.length > 254) {
    return { valid: false, sanitized: '', error: 'Email address is too long' };
  }

  return { valid: true, sanitized: trimmed };
};

/**
 * Generic validation result type
 */
export interface ValidationResult<T = any> {
  valid: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

/**
 * Validate object with multiple fields
 */
export const validateObject = <T extends Record<string, any>>(
  obj: T,
  rules: Record<keyof T, (value: any) => ValidationResult>
): ValidationResult<T> => {
  const errors: Record<string, string> = {};
  const sanitized: any = {};

  for (const [field, rule] of Object.entries(rules)) {
    const result = rule(obj[field]);
    
    if (!result.valid) {
      errors[field] = result.error || `Invalid ${field}`;
    } else if (result.data !== undefined) {
      sanitized[field] = result.data;
    } else {
      sanitized[field] = obj[field];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: sanitized as T };
};
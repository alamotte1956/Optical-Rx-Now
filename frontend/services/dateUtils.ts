// Date utility functions - handles MM/DD/YYYY format (US standard)

/**
 * Parse a date string in various formats and return a Date object
 * Supports: MM/DD/YYYY, YYYY-MM-DD, M/D/YYYY, etc.
 */
export const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  const trimmed = dateString.trim();
  
  // Try MM/DD/YYYY or M/D/YYYY format first (US format)
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const month = parseInt(usMatch[1], 10);
    const day = parseInt(usMatch[2], 10);
    const year = parseInt(usMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return new Date(year, month - 1, day);
    }
  }
  
  // Try YYYY-MM-DD format (ISO format)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return new Date(year, month - 1, day);
    }
  }
  
  // Try parsing ISO date strings (from createdAt, etc.)
  try {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch {
    // Fall through
  }
  
  return null;
};

/**
 * Format a date for display (e.g., "June 15, 2025")
 */
export const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  
  const date = parseDate(dateString);
  if (!date) return dateString;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a date for storage (YYYY-MM-DD format)
 */
export const formatDateForStorage = (dateString: string | null | undefined): string | null => {
  if (!dateString) return null;
  
  const date = parseDate(dateString);
  if (!date) return null;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format a date for input display (MM/DD/YYYY format)
 */
export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  
  const date = parseDate(dateString);
  if (!date) return dateString;
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
};

/**
 * Get today's date in MM/DD/YYYY format
 */
export const getTodayFormatted = (): string => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  
  return `${month}/${day}/${year}`;
};

/**
 * Check if a date is expired (in the past)
 */
export const isDateExpired = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  
  const date = parseDate(dateString);
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
};

/**
 * Check if a date is expiring soon (within 30 days)
 */
export const isDateExpiringSoon = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  
  const date = parseDate(dateString);
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const daysUntilExpiry = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
};

/**
 * Validate if a string is a valid date
 */
export const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  return parseDate(dateString) !== null;
};

/**
 * Convert any date format to storage format (YYYY-MM-DD)
 * Returns the original string if it can't be parsed
 */
export const normalizeDate = (dateString: string | null | undefined): string | null => {
  if (!dateString) return null;
  
  const stored = formatDateForStorage(dateString);
  return stored || dateString;
};

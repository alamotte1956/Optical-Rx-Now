import { format, parseISO, isValid, parse } from 'date-fns';

/**
 * Parses a date string with multiple fallback formats
 * Handles dates like: "2024-01-15", "Jan 15, 2024", "1/15/2024", etc.
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;

  // Try ISO format first (most reliable)
  const isoDate = parseISO(dateString);
  if (isValid(isoDate)) return isoDate;

  // Try common US formats
  const formats = [
    'MM/dd/yyyy',
    'MM-dd-yyyy',
    'MMM d, yyyy',
    'MMMM d, yyyy',
    'yyyy-MM-dd',
  ];

  for (const fmt of formats) {
    const parsed = parse(dateString, fmt, new Date());
    if (isValid(parsed)) return parsed;
  }

  // Fallback to Date constructor (less reliable but catches some edge cases)
  const fallback = new Date(dateString);
  return isValid(fallback) ? fallback : null;
}

/**
 * Formats a date for display in the UI
 * Example: "Jan 15, 2024"
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return 'Unknown date';

  const validDate = typeof date === 'string' ? parseDate(date) : date;
  if (!validDate) return 'Unknown date';

  return format(validDate, 'MMM d, yyyy');
}

/**
 * Gets a relative time string (e.g., "2 days ago", "in 3 hours")
 */
export function getRelativeTime(date: Date | string | null): string {
  if (!date) return 'Unknown';

  const validDate = typeof date === 'string' ? parseDate(date) : date;
  if (!validDate) return 'Unknown';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - validDate.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'Just now';
}

/**
 * Checks if a date is in the past
 */
export function isPastDate(date: Date | string | null): boolean {
  if (!date) return false;

  const validDate = typeof date === 'string' ? parseDate(date) : date;
  if (!validDate) return false;

  return validDate < new Date();
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date | string | null): boolean {
  if (!date) return false;

  const validDate = typeof date === 'string' ? parseDate(date) : date;
  if (!validDate) return false;

  const today = new Date();
  return (
    validDate.getDate() === today.getDate() &&
    validDate.getMonth() === today.getMonth() &&
    validDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a date is within the next 7 days
 */
export function isUpcoming(date: Date | string | null): boolean {
  if (!date) return false;

  const validDate = typeof date === 'string' ? parseDate(date) : date;
  if (!validDate) return false;

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return validDate > now && validDate <= sevenDaysFromNow;
}

/**
 * Formats a date for display (ISO to readable format)
 * Example: "2024-01-15" -> "Jan 15, 2024"
 */
export function formatDateForDisplay(dateString: string | null | undefined): string {
  if (!dateString) return 'No date';
  
  const validDate = parseDate(dateString);
  if (!validDate) return 'Invalid date';
  
  return format(validDate, 'MMM d, yyyy');
}

/**
 * Checks if a prescription date is expired
 */
export function isDateExpired(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  
  const validDate = parseDate(dateString);
  if (!validDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return validDate < today;
}

/**
 * Checks if a prescription date is expiring soon (within 30 days)
 */
export function isDateExpiringSoon(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  
  const validDate = parseDate(dateString);
  if (!validDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return validDate >= today && validDate <= thirtyDaysFromNow;
}

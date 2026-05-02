/**
 * Date formatting utilities for prescription expiration dates
 * 
 * NOTE: OCR functionality was removed per user request.
 * Users now manually enter expiration dates.
 */

/**
 * Format a date string for display (YYYY-MM-DD to MM/DD/YYYY)
 */
export function formatDateForDisplay(isoDate: string): string {
  try {
    const [year, month, day] = isoDate.split('-');
    return `${month}/${day}/${year}`;
  } catch {
    return isoDate;
  }
}

/**
 * Parse a display date string back to ISO format (MM/DD/YYYY to YYYY-MM-DD)
 */
export function parseDisplayDate(displayDate: string): string | null {
  try {
    const [month, day, year] = displayDate.split('/');
    if (month && day && year && year.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return null;
  } catch {
    return null;
  }
}

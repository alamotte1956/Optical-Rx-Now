/**
 * OCR Service for extracting expiration date from prescription images
 * 
 * HIPAA COMPLIANT: All processing happens ON-DEVICE only
 * No image data is sent to external servers
 * 
 * Currently uses manual date entry with future support for:
 * - react-native-mlkit-ocr (on-device ML)
 * - expo-ml-kit when available
 */

interface OCRResult {
  expiryDate: string | null;
  confidence: number;
  rawText?: string;
  method: "manual" | "on-device-ocr";
}

/**
 * Extract expiration date from prescription image
 * Currently returns null to prompt manual entry (HIPAA compliant)
 * 
 * Future: Will use on-device ML Kit OCR when integrated
 */
export const extractExpirationDate = async (
  imageUri: string
): Promise<OCRResult> => {
  try {
    console.log("OCR: On-device processing only (HIPAA compliant)");
    console.log("Image stored locally at:", imageUri);
    
    // HIPAA COMPLIANCE: No external API calls
    // User will manually enter expiration date
    // This ensures NO prescription data leaves the device
    
    // Future implementation with on-device ML Kit:
    // import MlkitOcr from 'react-native-mlkit-ocr';
    // const result = await MlkitOcr.detectFromUri(imageUri);
    // const text = result.map(block => block.text).join(' ');
    // return parseExpirationDate(text);
    
    return {
      expiryDate: null,
      confidence: 0,
      method: "manual",
    };
  } catch (error) {
    console.log("OCR error:", error);
    return { expiryDate: null, confidence: 0, method: "manual" };
  }
};

/**
 * Parse expiration date from OCR text
 * Looks for common date patterns in prescription images
 * 
 * This runs entirely on-device when ML Kit OCR is used
 */
export function parseExpirationDate(text: string): string | null {
  // Common patterns for expiration dates on prescriptions
  const patterns = [
    // Expiration: MM/DD/YYYY or Expires: MM/DD/YYYY
    /(?:expir(?:ation|es|y)?|exp|valid\s+until|good\s+(?:until|through|thru))[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    // RX Exp or Rx Expiration
    /(?:rx\s*exp(?:iration)?)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    // Date formats near expiration keywords: MM/DD/YYYY, MM-DD-YYYY
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g,
    // YYYY-MM-DD format
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
    // Month Day, Year (e.g., "January 15, 2025")
    /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      // Get the date part (group 1 or full match)
      const dateStr = matches[1] || matches[0];
      const normalized = normalizeDateFormat(dateStr);
      if (normalized && isValidPrescriptionDate(normalized)) {
        return normalized;
      }
    }
  }

  return null;
}

/**
 * Normalize date format to YYYY-MM-DD
 */
function normalizeDateFormat(dateStr: string): string | null {
  try {
    // Remove common prefixes
    dateStr = dateStr.replace(/^(?:expir(?:ation|es|y)?|exp|valid\s+until|good\s+(?:until|through|thru)|rx\s*exp(?:iration)?)[:\s]*/i, "").trim();

    let date: Date | null = null;

    // MM/DD/YYYY or MM-DD-YYYY
    const mmddyyyyMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (mmddyyyyMatch) {
      const [, month, day, year] = mmddyyyyMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // MM/DD/YY format
    const mmddyyMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
    if (!date && mmddyyMatch) {
      const [, month, day, year] = mmddyyMatch;
      const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
      date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    }

    // YYYY-MM-DD or YYYY/MM/DD
    const yyyymmddMatch = dateStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (!date && yyyymmddMatch) {
      const [, year, month, day] = yyyymmddMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Month Day, Year (e.g., "January 15, 2025")
    if (!date) {
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) {
        date = new Date(parsed);
      }
    }

    if (date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return null;
  } catch (error) {
    console.log("Date normalization error:", error);
    return null;
  }
}

/**
 * Check if date is valid for a prescription
 * Prescriptions are usually valid for 1-2 years from issue date
 */
function isValidPrescriptionDate(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(now.getFullYear() - 2);
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(now.getFullYear() + 5);

    // Date should be between 2 years ago and 5 years from now
    return date >= twoYearsAgo && date <= fiveYearsFromNow;
  } catch {
    return false;
  }
}

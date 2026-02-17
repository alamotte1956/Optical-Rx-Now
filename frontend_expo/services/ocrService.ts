import * as FileSystem from "expo-file-system";

/**
 * OCR Service for extracting expiration date from prescription images
 * Uses pattern matching and date recognition
 */

interface OCRResult {
  expiryDate: string | null;
  confidence: number;
  rawText?: string;
}

/**
 * Extract expiration date from prescription image
 * Uses basic OCR with OCR.space free API
 */
export const extractExpirationDate = async (
  imageUri: string
): Promise<OCRResult> => {
  try {
    console.log("Starting OCR for expiration date extraction...");

    // Get OCR API URL from environment variable
    const ocrApiUrl = process.env.EXPO_PUBLIC_OCR_API_URL;
    if (!ocrApiUrl) {
      console.error("EXPO_PUBLIC_OCR_API_URL environment variable is not set");
      return { expiryDate: null, confidence: 0 };
    }

    // Read image as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Use OCR.space API
    const formData = new FormData();
    formData.append("base64Image", `data:image/jpeg;base64,${base64}`);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2");

    const response = await fetch(ocrApiUrl, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.IsErroredOnProcessing) {
      console.log("OCR processing error:", result.ErrorMessage);
      return { expiryDate: null, confidence: 0 };
    }

    const extractedText =
      result.ParsedResults?.[0]?.ParsedText || "";
    console.log("Extracted text:", extractedText);

    // Parse expiration date from text
    const expiryDate = parseExpirationDate(extractedText);

    return {
      expiryDate,
      confidence: expiryDate ? 0.8 : 0,
      rawText: extractedText,
    };
  } catch (error) {
    console.log("OCR error:", error);
    return { expiryDate: null, confidence: 0 };
  }
};

/**
 * Parse expiration date from OCR text
 * Looks for common date patterns in prescription images
 */
function parseExpirationDate(text: string): string | null {
  // Common patterns for expiration dates on prescriptions
  const patterns = [
    // Expiration: MM/DD/YYYY or Expires: MM/DD/YYYY
    /(?:expir(?:ation|es|y)?|exp|valid\s+until)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    // Date formats: MM/DD/YYYY, MM-DD-YYYY
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
      if (normalized && isValidFutureDate(normalized)) {
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
    dateStr = dateStr.replace(/^(?:expir(?:ation|es|y)?|exp|valid\s+until)[:\s]*/i, "");

    // Try to parse different formats
    let date: Date | null = null;

    // MM/DD/YYYY or MM-DD-YYYY
    const mmddyyyyMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (mmddyyyyMatch) {
      const [, month, day, year] = mmddyyyyMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // YYYY-MM-DD or YYYY/MM/DD
    const yyyymmddMatch = dateStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (!date && yyyymmddMatch) {
      const [, year, month, day] = yyyymmddMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Month Day, Year
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
 * Check if date is valid and in the future (or within last year)
 * Prescriptions are usually valid for 1-2 years
 */
function isValidFutureDate(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(now.getFullYear() + 5);

    // Date should be between 1 year ago and 5 years from now
    return date >= oneYearAgo && date <= fiveYearsFromNow;
  } catch {
    return false;
  }
}

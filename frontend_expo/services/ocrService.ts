/**
 * OCR Service for extracting expiration date from prescription images
 * 
 * HIPAA COMPLIANT: All processing happens ON-DEVICE only using ML Kit
 * No image data is ever sent to external servers
 */

import { Platform } from "react-native";

interface OCRResult {
  expiryDate: string | null;
  confidence: number;
  rawText?: string;
  method: "on-device-ocr" | "manual";
}

/**
 * Extract expiration date from prescription image using on-device ML Kit OCR
 * All processing happens locally on the device - HIPAA compliant
 */
export const extractExpirationDate = async (
  imageUri: string
): Promise<OCRResult> => {
  try {
    console.log("OCR: Starting on-device text recognition (HIPAA compliant)");
    
    // Dynamic import to handle web platform gracefully
    let TextRecognition: any;
    try {
      TextRecognition = require("@react-native-ml-kit/text-recognition").default;
    } catch (e) {
      console.log("ML Kit not available on this platform, using manual entry");
      return { expiryDate: null, confidence: 0, method: "manual" };
    }

    // Perform on-device OCR using ML Kit
    const result = await TextRecognition.recognize(imageUri);
    
    if (!result || !result.text) {
      console.log("OCR: No text detected in image");
      return { expiryDate: null, confidence: 0, method: "on-device-ocr" };
    }

    const extractedText = result.text;
    console.log("OCR: Extracted text length:", extractedText.length);
    
    // Parse expiration date from the extracted text
    const expiryDate = parseExpirationDate(extractedText);
    
    if (expiryDate) {
      console.log("OCR: Found expiration date:", expiryDate);
      return {
        expiryDate,
        confidence: 0.85,
        rawText: extractedText,
        method: "on-device-ocr",
      };
    }

    console.log("OCR: No expiration date pattern found in text");
    return {
      expiryDate: null,
      confidence: 0,
      rawText: extractedText,
      method: "on-device-ocr",
    };
  } catch (error) {
    console.log("OCR error:", error);
    return { expiryDate: null, confidence: 0, method: "manual" };
  }
};

/**
 * Parse expiration date from OCR text
 * Looks for common date patterns found on optical prescriptions
 */
export function parseExpirationDate(text: string): string | null {
  // Normalize text - handle line breaks and multiple spaces
  const normalizedText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  
  console.log("OCR: Parsing text for expiration date, length:", normalizedText.length);
  
  // Common patterns for expiration dates on optical prescriptions
  const patterns = [
    // Explicit expiration labels (highest priority)
    /(?:expir(?:ation|es|y)?|exp\.?|valid\s+(?:until|thru|through)|good\s+(?:until|thru|through)|rx\s*exp(?:iration)?)[:\s]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
    
    // "Expires" followed by date
    /expires?\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
    
    // "Exp" or "EXP" followed by date
    /\bexp\.?\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
    
    // "Valid until" or "Good until"
    /(?:valid|good)\s+(?:until|thru|through)\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
    
    // "Rx expiration" or "prescription expiration"
    /(?:rx|prescription)\s*(?:expir(?:ation|es)?)\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
    
    // Month name formats: "Expires January 15, 2026"
    /(?:expir(?:ation|es|y)?|exp\.?|valid\s+until)[:\s]*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})/i,
    
    // Month name formats: "January 15, 2026" near expiration keywords
    /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      console.log("OCR: Found pattern match:", match[0]);
      const normalized = normalizeDateMatch(match);
      if (normalized && isValidPrescriptionDate(normalized)) {
        console.log("OCR: Valid prescription date found:", normalized);
        return normalized;
      }
    }
  }

  // Fallback: look for any date that could be an expiration (future date)
  const genericDatePatterns = [
    // MM/DD/YYYY or MM-DD-YYYY or MM.DD.YYYY
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
    // MM/DD/YY
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})\b/g,
    // YYYY-MM-DD (ISO format)
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,
  ];

  for (const pattern of genericDatePatterns) {
    const matches = [...normalizedText.matchAll(pattern)];
    for (const match of matches) {
      // Check if it's ISO format (year first)
      let normalized: string | null = null;
      if (match[1].length === 4) {
        // ISO format: YYYY-MM-DD
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          normalized = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      } else {
        normalized = normalizeDateMatch(match);
      }
      
      if (normalized && isFutureDate(normalized)) {
        console.log("OCR: Found future date (likely expiration):", normalized);
        return normalized;
      }
    }
  }

  console.log("OCR: No expiration date pattern found in text");
  return null;
}

/**
 * Normalize a regex date match to YYYY-MM-DD format
 */
function normalizeDateMatch(match: RegExpMatchArray): string | null {
  try {
    // Check if it's a month name format
    const monthNames: { [key: string]: number } = {
      jan: 1, january: 1,
      feb: 2, february: 2,
      mar: 3, march: 3,
      apr: 4, april: 4,
      may: 5,
      jun: 6, june: 6,
      jul: 7, july: 7,
      aug: 8, august: 8,
      sep: 9, september: 9,
      oct: 10, october: 10,
      nov: 11, november: 11,
      dec: 12, december: 12,
    };

    let month: number, day: number, year: number;

    // Check if first capture group is a month name
    const monthKey = match[1]?.toLowerCase();
    if (monthNames[monthKey]) {
      month = monthNames[monthKey];
      day = parseInt(match[2]);
      year = parseInt(match[3]);
    } else {
      // Numeric format MM/DD/YYYY or MM/DD/YY
      month = parseInt(match[1]);
      day = parseInt(match[2]);
      year = parseInt(match[3]);
      
      // Handle 2-digit year
      if (year < 100) {
        year = year > 50 ? 1900 + year : 2000 + year;
      }
    }

    // Validate ranges
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    // Format as YYYY-MM-DD
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } catch (error) {
    return null;
  }
}

/**
 * Check if date is valid for a prescription (within reasonable range)
 */
function isValidPrescriptionDate(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(now.getFullYear() - 3);
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(now.getFullYear() + 5);

    return date >= threeYearsAgo && date <= fiveYearsFromNow;
  } catch {
    return false;
  }
}

/**
 * Check if date is in the future (likely expiration date)
 */
function isFutureDate(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(now.getFullYear() + 5);

    // Date should be in the future but not too far
    return date > now && date <= fiveYearsFromNow;
  } catch {
    return false;
  }
}

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

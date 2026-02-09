// OCR Service using expo-text-extractor (client-side, on-device)
// Extracts expiration dates from prescription images using ML Kit (Android) and Vision (iOS)

import { isSupported, extractTextFromImage } from "expo-text-extractor";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

interface OCRResult {
  success: boolean;
  expiryDate: string | null;
  message: string;
  rawText?: string;
}

// Date patterns to look for in extracted text
const DATE_PATTERNS = [
  // MM/DD/YYYY or M/D/YYYY
  /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  // MM-DD-YYYY or M-D-YYYY
  /(\d{1,2})-(\d{1,2})-(\d{4})/,
  // YYYY-MM-DD
  /(\d{4})-(\d{2})-(\d{2})/,
  // Month DD, YYYY or Month DD YYYY
  /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})/i,
];

// Keywords that indicate expiration date
const EXPIRY_KEYWORDS = [
  /exp(?:iration)?(?:\s+date)?/i,
  /expires?/i,
  /valid\s+(?:until|thru|through)/i,
  /good\s+(?:until|thru|through)/i,
  /rx\s+exp/i,
  /prescription\s+exp/i,
];

const monthNameToNumber: { [key: string]: string } = {
  january: "01", jan: "01",
  february: "02", feb: "02",
  march: "03", mar: "03",
  april: "04", apr: "04",
  may: "05",
  june: "06", jun: "06",
  july: "07", jul: "07",
  august: "08", aug: "08",
  september: "09", sep: "09",
  october: "10", oct: "10",
  november: "11", nov: "11",
  december: "12", dec: "12",
};

/**
 * Parse date string to YYYY-MM-DD format
 */
const parseDateToISO = (match: RegExpMatchArray, patternIndex: number): string | null => {
  try {
    let year: string, month: string, day: string;

    if (patternIndex === 0 || patternIndex === 1) {
      // MM/DD/YYYY or MM-DD-YYYY format (US)
      month = match[1].padStart(2, "0");
      day = match[2].padStart(2, "0");
      year = match[3];
    } else if (patternIndex === 2) {
      // YYYY-MM-DD format
      year = match[1];
      month = match[2];
      day = match[3];
    } else if (patternIndex === 3) {
      // Month DD, YYYY format
      const monthName = match[1].toLowerCase();
      month = monthNameToNumber[monthName] || monthNameToNumber[monthName.substring(0, 3)] || "01";
      day = match[2].padStart(2, "0");
      year = match[3];
    } else {
      return null;
    }

    // Validate the date
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    if (yearNum < 2020 || yearNum > 2035) return null;
    if (monthNum < 1 || monthNum > 12) return null;
    if (dayNum < 1 || dayNum > 31) return null;

    // Check if date is reasonable (within 3 years from now)
    const date = new Date(yearNum, monthNum - 1, dayNum);
    const now = new Date();
    const threeYearsFromNow = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    if (date < oneYearAgo || date > threeYearsFromNow) return null;

    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
};

/**
 * Find the most likely expiration date from extracted text
 */
const findExpirationDate = (textLines: string[]): string | null => {
  const fullText = textLines.join(" ").replace(/\s+/g, " ");
  
  console.log("OCR extracted text:", fullText);

  // First, look for dates near expiry keywords
  for (const keyword of EXPIRY_KEYWORDS) {
    const keywordMatch = fullText.match(keyword);
    if (keywordMatch) {
      // Look for a date within 50 characters after the keyword
      const startIndex = keywordMatch.index || 0;
      const textAfterKeyword = fullText.substring(startIndex, startIndex + 50);
      
      for (let i = 0; i < DATE_PATTERNS.length; i++) {
        const dateMatch = textAfterKeyword.match(DATE_PATTERNS[i]);
        if (dateMatch) {
          const isoDate = parseDateToISO(dateMatch, i);
          if (isoDate) {
            console.log(`Found expiry date near keyword "${keywordMatch[0]}": ${isoDate}`);
            return isoDate;
          }
        }
      }
    }
  }

  // If no keyword-associated date found, look for any date that looks like an expiration
  // (typically 1-2 years in the future)
  const allDates: { date: string; score: number }[] = [];
  
  for (let i = 0; i < DATE_PATTERNS.length; i++) {
    const regex = new RegExp(DATE_PATTERNS[i], "gi");
    let match;
    
    while ((match = regex.exec(fullText)) !== null) {
      const isoDate = parseDateToISO(match, i);
      if (isoDate) {
        const date = new Date(isoDate);
        const now = new Date();
        const monthsFromNow = (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
        
        // Score based on how likely this is to be an expiry date
        // Dates 6-24 months from now are most likely expiry dates
        let score = 0;
        if (monthsFromNow >= 6 && monthsFromNow <= 24) {
          score = 100;
        } else if (monthsFromNow > 0 && monthsFromNow < 36) {
          score = 50;
        } else if (monthsFromNow >= 0) {
          score = 10;
        }
        
        if (score > 0) {
          allDates.push({ date: isoDate, score });
        }
      }
    }
  }

  // Return the highest scored date
  if (allDates.length > 0) {
    allDates.sort((a, b) => b.score - a.score);
    console.log("Found potential expiry dates:", allDates);
    return allDates[0].date;
  }

  return null;
};

/**
 * Save base64 image to a temporary file and return the URI
 */
const saveBase64ToTempFile = async (base64Data: string): Promise<string> => {
  // Clean up base64 string
  let cleanBase64 = base64Data;
  if (cleanBase64.includes(",")) {
    cleanBase64 = cleanBase64.split(",")[1];
  }

  const fileName = `prescription_${Date.now()}.jpg`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, cleanBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return filePath;
};

/**
 * Extract expiration date from a prescription image using on-device OCR
 */
export const extractExpiryDateFromImage = async (
  imageBase64: string
): Promise<OCRResult> => {
  try {
    // Check if OCR is supported on this device
    if (!isSupported) {
      console.log("OCR not supported on this device/platform");
      return {
        success: false,
        expiryDate: null,
        message: Platform.OS === "web" 
          ? "OCR is not available in web preview. Please use the mobile app to scan prescriptions."
          : "OCR is not supported on this device. Please enter the expiration date manually.",
      };
    }

    // Save base64 to temporary file
    const tempFilePath = await saveBase64ToTempFile(imageBase64);
    
    console.log("Running OCR on image:", tempFilePath);

    // Extract text from image
    const extractedLines = await extractTextFromImage(tempFilePath);

    // Clean up temp file
    try {
      await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
    } catch {
      // Ignore cleanup errors
    }

    if (!extractedLines || extractedLines.length === 0) {
      return {
        success: false,
        expiryDate: null,
        message: "No text found in the image. Please enter the expiration date manually.",
        rawText: "",
      };
    }

    const rawText = extractedLines.join("\n");
    console.log("OCR extracted lines:", extractedLines);

    // Find expiration date in extracted text
    const expiryDate = findExpirationDate(extractedLines);

    if (expiryDate) {
      return {
        success: true,
        expiryDate,
        message: "Expiration date detected successfully!",
        rawText,
      };
    }

    return {
      success: false,
      expiryDate: null,
      message: "No expiration date found in the image. Please enter it manually.",
      rawText,
    };
  } catch (error) {
    console.log("OCR extraction error:", error);
    return {
      success: false,
      expiryDate: null,
      message: "Error analyzing image. Please enter the expiration date manually.",
    };
  }
};

// OCR Service - Client-side text extraction from prescription images
// Uses expo-text-extractor on iOS/Android (ML Kit and Vision)
// Gracefully handles web platform where OCR is not available

import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

interface OCRResult {
  success: boolean;
  expiryDate: string | null;
  message: string;
  rawText?: string;
}

// Check if we're on a native platform that can support OCR
const isNativePlatform = Platform.OS === "ios" || Platform.OS === "android";

// Date patterns to look for in extracted text - expanded for better detection
const DATE_PATTERNS = [
  // MM/DD/YYYY or M/D/YYYY (most common US format)
  /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  // MM/DD/YY or M/D/YY
  /(\d{1,2})\/(\d{1,2})\/(\d{2})(?!\d)/,
  // MM-DD-YYYY or M-D-YYYY
  /(\d{1,2})-(\d{1,2})-(\d{4})/,
  // MM-DD-YY
  /(\d{1,2})-(\d{1,2})-(\d{2})(?!\d)/,
  // YYYY-MM-DD (ISO format)
  /(\d{4})-(\d{2})-(\d{2})/,
  // Month DD, YYYY or Month DD YYYY
  /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[.,]?\s+(\d{1,2})[,.]?\s+(\d{4})/i,
  // DD Month YYYY (European format)
  /(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.]?\s+(\d{4})/i,
  // MMDDYYYY (no separators)
  /(\d{2})(\d{2})(\d{4})/,
];

// Keywords that indicate expiration date - expanded
const EXPIRY_KEYWORDS = [
  /exp(?:iration)?(?:\s+date)?[:\s]*/i,
  /expires?[:\s]*/i,
  /valid\s+(?:until|thru|through|til)[:\s]*/i,
  /good\s+(?:until|thru|through|til)[:\s]*/i,
  /rx\s+exp[:\s]*/i,
  /prescription\s+exp[:\s]*/i,
  /use\s+by[:\s]*/i,
  /not\s+valid\s+after[:\s]*/i,
  /expiry[:\s]*/i,
  /exp\s*date[:\s]*/i,
  /date\s+of\s+expiry[:\s]*/i,
  /void\s+after[:\s]*/i,
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

    if (patternIndex === 0) {
      // MM/DD/YYYY format
      month = match[1].padStart(2, "0");
      day = match[2].padStart(2, "0");
      year = match[3];
    } else if (patternIndex === 1) {
      // MM/DD/YY format - convert to 4-digit year
      month = match[1].padStart(2, "0");
      day = match[2].padStart(2, "0");
      const shortYear = parseInt(match[3]);
      year = (shortYear >= 0 && shortYear <= 50) ? `20${match[3].padStart(2, "0")}` : `19${match[3].padStart(2, "0")}`;
    } else if (patternIndex === 2) {
      // MM-DD-YYYY format
      month = match[1].padStart(2, "0");
      day = match[2].padStart(2, "0");
      year = match[3];
    } else if (patternIndex === 3) {
      // MM-DD-YY format
      month = match[1].padStart(2, "0");
      day = match[2].padStart(2, "0");
      const shortYear = parseInt(match[3]);
      year = (shortYear >= 0 && shortYear <= 50) ? `20${match[3].padStart(2, "0")}` : `19${match[3].padStart(2, "0")}`;
    } else if (patternIndex === 4) {
      // YYYY-MM-DD format (ISO)
      year = match[1];
      month = match[2];
      day = match[3];
    } else if (patternIndex === 5) {
      // Month DD, YYYY format
      const monthName = match[1].toLowerCase();
      month = monthNameToNumber[monthName] || monthNameToNumber[monthName.substring(0, 3)] || "01";
      day = match[2].padStart(2, "0");
      year = match[3];
    } else if (patternIndex === 6) {
      // DD Month YYYY format (European)
      day = match[1].padStart(2, "0");
      const monthName = match[2].toLowerCase();
      month = monthNameToNumber[monthName] || monthNameToNumber[monthName.substring(0, 3)] || "01";
      year = match[3];
    } else if (patternIndex === 7) {
      // MMDDYYYY format (no separators)
      month = match[1];
      day = match[2];
      year = match[3];
    } else {
      return null;
    }

    // Validate the date components
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    if (yearNum < 2020 || yearNum > 2040) return null;
    if (monthNum < 1 || monthNum > 12) return null;
    if (dayNum < 1 || dayNum > 31) return null;

    // Check if date is reasonable for a prescription expiry
    // Prescriptions are typically valid for 1-2 years
    const date = new Date(yearNum, monthNum - 1, dayNum);
    const now = new Date();
    const fourYearsFromNow = new Date(now.getFullYear() + 4, now.getMonth(), now.getDate());
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

    if (date < twoYearsAgo || date > fourYearsFromNow) return null;

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  } catch (error) {
    console.log("Date parsing error:", error);
    return null;
  }
};

/**
 * Preprocess text for better OCR date detection
 */
const preprocessText = (text: string): string => {
  return text
    // Common OCR mistakes
    .replace(/[oO]/g, (match, offset, str) => {
      // Replace O with 0 if surrounded by numbers
      const before = str[offset - 1];
      const after = str[offset + 1];
      if ((before && /\d/.test(before)) || (after && /\d/.test(after))) {
        return "0";
      }
      return match;
    })
    .replace(/[lI]/g, (match, offset, str) => {
      // Replace l/I with 1 if surrounded by numbers
      const before = str[offset - 1];
      const after = str[offset + 1];
      if ((before && /\d/.test(before)) || (after && /\d/.test(after))) {
        return "1";
      }
      return match;
    })
    .replace(/[sS](?=\d)/g, "5") // S followed by digit -> 5
    .replace(/(?<=\d)[sS]/g, "5") // digit followed by S -> 5
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

/**
 * Find the most likely expiration date from extracted text
 */
const findExpirationDate = (textLines: string[]): string | null => {
  // Join and preprocess text
  const rawText = textLines.join(" ");
  const fullText = preprocessText(rawText);
  
  console.log("OCR raw text:", rawText);
  console.log("OCR preprocessed text:", fullText);

  // First priority: Look for dates near expiry keywords
  for (const keyword of EXPIRY_KEYWORDS) {
    const keywordMatch = fullText.match(keyword);
    if (keywordMatch) {
      console.log(`Found expiry keyword: "${keywordMatch[0]}"`);
      
      // Look for a date within 60 characters after the keyword
      const startIndex = keywordMatch.index || 0;
      const textAfterKeyword = fullText.substring(startIndex, startIndex + 60);
      
      console.log(`Text after keyword: "${textAfterKeyword}"`);
      
      for (let i = 0; i < DATE_PATTERNS.length; i++) {
        const dateMatch = textAfterKeyword.match(DATE_PATTERNS[i]);
        if (dateMatch) {
          const isoDate = parseDateToISO(dateMatch, i);
          if (isoDate) {
            console.log(`Found expiry date near keyword: ${isoDate}`);
            return isoDate;
          }
        }
      }
    }
  }

  // Second priority: Look for any date that looks like a future expiration
  const allDates: { date: string; score: number; context: string }[] = [];
  
  for (let i = 0; i < DATE_PATTERNS.length; i++) {
    const regex = new RegExp(DATE_PATTERNS[i].source, "gi");
    let match;
    
    while ((match = regex.exec(fullText)) !== null) {
      const isoDate = parseDateToISO(match, i);
      if (isoDate) {
        const date = new Date(isoDate);
        const now = new Date();
        const monthsFromNow = (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
        
        // Score based on how likely this is to be an expiry date
        let score = 0;
        
        // Future dates within typical prescription validity (6-24 months) score highest
        if (monthsFromNow >= 6 && monthsFromNow <= 24) {
          score = 100;
        } else if (monthsFromNow > 0 && monthsFromNow < 36) {
          score = 75;
        } else if (monthsFromNow >= -6 && monthsFromNow <= 0) {
          // Recently expired prescriptions
          score = 50;
        } else if (monthsFromNow > -12) {
          score = 25;
        }
        
        // Boost score if near expiry-related words
        const contextStart = Math.max(0, (match.index || 0) - 30);
        const contextEnd = Math.min(fullText.length, (match.index || 0) + match[0].length + 30);
        const context = fullText.substring(contextStart, contextEnd).toLowerCase();
        
        if (/exp|valid|void|use\s*by/i.test(context)) {
          score += 50;
        }
        
        if (score > 0) {
          allDates.push({ date: isoDate, score, context });
        }
      }
    }
  }

  // Return the highest scored date
  if (allDates.length > 0) {
    allDates.sort((a, b) => b.score - a.score);
    console.log("All potential expiry dates found:", allDates);
    return allDates[0].date;
  }

  console.log("No valid expiration dates found in text");
  return null;
};

/**
 * Save base64 image to a temporary file and return the URI
 */
const saveBase64ToTempFile = async (base64Data: string): Promise<string> => {
  // Clean up base64 string - remove data URI prefix if present
  let cleanBase64 = base64Data;
  if (cleanBase64.includes(",")) {
    cleanBase64 = cleanBase64.split(",")[1];
  }
  
  // Remove any whitespace
  cleanBase64 = cleanBase64.replace(/\s/g, "");

  const fileName = `prescription_ocr_${Date.now()}.jpg`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  console.log(`Saving temp file for OCR: ${filePath}`);
  console.log(`Base64 data length: ${cleanBase64.length}`);

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
  console.log("=== Starting OCR extraction ===");
  console.log(`Platform: ${Platform.OS}`);
  console.log(`Image data length: ${imageBase64?.length || 0}`);

  // Validate input
  if (!imageBase64 || imageBase64.length < 100) {
    console.log("Invalid or missing image data for OCR");
    return {
      success: false,
      expiryDate: null,
      message: "No image provided for scanning.",
    };
  }

  // On web, OCR is not available
  if (Platform.OS === "web") {
    console.log("OCR not available on web platform");
    return {
      success: false,
      expiryDate: null,
      message: "OCR scanning is only available on mobile devices. Please enter the expiration date manually.",
    };
  }

  try {
    // Dynamically import expo-text-extractor (only works on native platforms)
    let isSupported: boolean = false;
    let extractTextFromImage: ((uri: string) => Promise<string[]>) | null = null;
    
    try {
      const textExtractor = await import("expo-text-extractor");
      isSupported = textExtractor.isSupported;
      extractTextFromImage = textExtractor.extractTextFromImage;
      console.log(`expo-text-extractor loaded, isSupported: ${isSupported}`);
    } catch (importError) {
      console.log("expo-text-extractor import error:", importError);
      return {
        success: false,
        expiryDate: null,
        message: "OCR scanning is not available. Please enter the expiration date manually.",
      };
    }

    // Check if OCR is supported on this device
    if (!isSupported || !extractTextFromImage) {
      console.log("OCR not supported on this device");
      return {
        success: false,
        expiryDate: null,
        message: "OCR is not supported on this device. Please enter the expiration date manually.",
      };
    }

    // Save base64 to temporary file
    let tempFilePath: string;
    try {
      tempFilePath = await saveBase64ToTempFile(imageBase64);
      console.log(`Temp file created: ${tempFilePath}`);
    } catch (fileError) {
      console.log("Error creating temp file:", fileError);
      return {
        success: false,
        expiryDate: null,
        message: "Error processing image. Please enter the expiration date manually.",
      };
    }

    // Extract text from image
    console.log("Running OCR text extraction...");
    let extractedLines: string[];
    try {
      extractedLines = await extractTextFromImage(tempFilePath);
      console.log(`OCR returned ${extractedLines?.length || 0} lines`);
    } catch (ocrError) {
      console.log("OCR extraction error:", ocrError);
      return {
        success: false,
        expiryDate: null,
        message: "Error reading text from image. Please enter the expiration date manually.",
      };
    }

    // Clean up temp file
    try {
      await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
      console.log("Temp file cleaned up");
    } catch {
      // Ignore cleanup errors
    }

    if (!extractedLines || extractedLines.length === 0) {
      console.log("No text extracted from image");
      return {
        success: false,
        expiryDate: null,
        message: "No text found in the image. Please ensure the prescription is clearly visible and try again, or enter the expiration date manually.",
        rawText: "",
      };
    }

    const rawText = extractedLines.join("\n");
    console.log("OCR extracted text lines:", extractedLines);

    // Find expiration date in extracted text
    const expiryDate = findExpirationDate(extractedLines);

    if (expiryDate) {
      console.log(`SUCCESS: Found expiry date: ${expiryDate}`);
      return {
        success: true,
        expiryDate,
        message: "Expiration date detected successfully!",
        rawText,
      };
    }

    console.log("No expiry date found in extracted text");
    return {
      success: false,
      expiryDate: null,
      message: "No expiration date found. Please enter it manually or try taking a clearer photo of the expiration date area.",
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

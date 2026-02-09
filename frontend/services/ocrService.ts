// OCR Service using GPT-4 Vision via Emergent LLM Key
// Extracts expiration dates from prescription images

import { Platform } from "react-native";

const EMERGENT_LLM_KEY = "sk-emergent-fC67aCd396b6502B05";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface OCRResult {
  success: boolean;
  expiryDate: string | null;
  message: string;
  rawResponse?: string;
}

export const extractExpiryDateFromImage = async (
  imageBase64: string
): Promise<OCRResult> => {
  try {
    // Clean up base64 string - remove data URL prefix if present
    let base64Data = imageBase64;
    if (base64Data.includes(",")) {
      base64Data = base64Data.split(",")[1];
    }

    // Determine image type
    let mediaType = "image/jpeg";
    if (imageBase64.includes("data:image/png")) {
      mediaType = "image/png";
    } else if (imageBase64.includes("data:image/webp")) {
      mediaType = "image/webp";
    }

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EMERGENT_LLM_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an OCR assistant specialized in reading eyeglass and contact lens prescriptions.
Your task is to find and extract ONLY the expiration date from the prescription image.
Look for terms like: "Expiration Date", "Expires", "Exp", "Exp Date", "Valid Until", "Good Through", "Rx Expires", "Prescription Expires", "Valid Thru".
The expiration date is typically 1-2 years from the exam date.

IMPORTANT RULES:
1. Return ONLY the date in YYYY-MM-DD format
2. If the date shows MM/DD/YYYY, convert it to YYYY-MM-DD
3. If the date shows DD/MM/YYYY (European), convert it to YYYY-MM-DD
4. If you see "Exp: 01/15/2025" respond with "2025-01-15"
5. If you cannot find any expiration date, respond with exactly "NOT_FOUND"
6. Do not include any other text, just the date or "NOT_FOUND"`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Find the expiration date on this prescription. Return ONLY the date in YYYY-MM-DD format, or NOT_FOUND if you cannot find it.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mediaType};base64,${base64Data}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 100,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("OCR API error:", errorText);
      return {
        success: false,
        expiryDate: null,
        message: "Failed to analyze image. Please enter the expiration date manually.",
        rawResponse: errorText,
      };
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content?.trim() || "";

    console.log("OCR Response:", responseText);

    // Check if no date found
    if (
      responseText === "NOT_FOUND" ||
      responseText.toLowerCase().includes("not found") ||
      responseText.toLowerCase().includes("cannot find") ||
      responseText.toLowerCase().includes("unable to")
    ) {
      return {
        success: false,
        expiryDate: null,
        message: "No expiration date found in the image. Please enter it manually.",
        rawResponse: responseText,
      };
    }

    // Try to parse and validate the date
    const dateMatch = responseText.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const extractedDate = dateMatch[1];
      // Validate it's a real date
      const parsedDate = new Date(extractedDate);
      if (!isNaN(parsedDate.getTime())) {
        return {
          success: true,
          expiryDate: extractedDate,
          message: "Expiration date detected successfully!",
          rawResponse: responseText,
        };
      }
    }

    // Try other date formats in the response
    const altFormats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY
      /(\w+)\s+(\d{1,2}),?\s+(\d{4})/, // Month DD, YYYY
    ];

    for (const format of altFormats) {
      const match = responseText.match(format);
      if (match) {
        try {
          let year, month, day;
          if (format === altFormats[0] || format === altFormats[1]) {
            // Assume MM/DD/YYYY (US format)
            month = match[1].padStart(2, "0");
            day = match[2].padStart(2, "0");
            year = match[3];
          } else {
            // Month name format
            const monthNames: { [key: string]: string } = {
              january: "01", february: "02", march: "03", april: "04",
              may: "05", june: "06", july: "07", august: "08",
              september: "09", october: "10", november: "11", december: "12",
              jan: "01", feb: "02", mar: "03", apr: "04",
              jun: "06", jul: "07", aug: "08", sep: "09",
              oct: "10", nov: "11", dec: "12",
            };
            month = monthNames[match[1].toLowerCase()] || "01";
            day = match[2].padStart(2, "0");
            year = match[3];
          }
          const formattedDate = `${year}-${month}-${day}`;
          const parsedDate = new Date(formattedDate);
          if (!isNaN(parsedDate.getTime())) {
            return {
              success: true,
              expiryDate: formattedDate,
              message: "Expiration date detected successfully!",
              rawResponse: responseText,
            };
          }
        } catch (e) {
          continue;
        }
      }
    }

    // If we got a response but couldn't parse it
    return {
      success: false,
      expiryDate: null,
      message: "Could not parse the expiration date. Please enter it manually.",
      rawResponse: responseText,
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

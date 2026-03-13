import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from 'expo-file-system';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);

/**
 * Simple ping to verify Gemini API connectivity.
 */
export const pingGemini = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello!");
    return result.response.text();
  } catch (error) {
    console.error("Gemini Ping Error:", error);
    throw error;
  }
};

/**
 * Analyzes a product image using Gemini 1.5 Flash.
 * 
 * @param {string} imageUri - The local URI of the image to analyze.
 * @returns {Promise<object>} - Analyzed data in JSON format.
 */
export const analyzeProductImage = async (imageUri) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. Convert local image URI to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const prompt = `
      Analyze this product image and:
      1. Extract the Product Name, Price, and any visible Category.
      2. Generate a catchy Instagram-style caption (including 3 local hashtags like #AltonaNorth #SupportLocal).
      3. Check for any mention of a sale or expiration date.

      Return the response in STRICT JSON format with exactly these fields:
      {
        "product_name": "",
        "price": 0.00,
        "caption": "",
        "category": "",
        "expiry_date": ""
      }

      Do not include any text other than the JSON object.
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg", // ImagePicker usually provides jpegs
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // 2. Clean and parse JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze image with AI.");
  }
};

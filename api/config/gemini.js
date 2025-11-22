import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

/**
 * Configuration for different Gemini models
 */
export const GEMINI_CONFIG = {
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
};

/**
 * Get the Gemini model instance
 */
export const getGeminiModel = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not configured. Please add it to your .env file.');
  }
  
  return genAI.getGenerativeModel({ 
    model: GEMINI_CONFIG.model,
    generationConfig: GEMINI_CONFIG.generationConfig,
    safetySettings: GEMINI_CONFIG.safetySettings,
  });
};

export default genAI;
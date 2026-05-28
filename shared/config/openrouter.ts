// shared/config/openrouter.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { FREE_MODELS } from './free-models.js';

// Determine the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

// Load the .env file explicitly from the root
dotenv.config({ path: path.resolve(rootDir, ".env") });

/**
 * Helper to determine which model to use.
 * Defaults to the first verified free model if OPENROUTER_MODEL is unset.
 */
const getModel = () => {
  return process.env.OPENROUTER_MODEL || FREE_MODELS[0];
};

// Configuration Constants
export const OPENROUTER_MODEL = getModel();
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Export API Key (Ensure this matches the key expected by the SDK)
export const OPENAI_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

// Required Headers for OpenRouter (useful for attribution/rankings)
export const OPENROUTER_HEADERS = { 
  'X-Title': 'OpenRouter Agents SDK Course',
  'HTTP-Referer': 'https://github.com/your-repo/path' // Optional: Replace with your actual repo URL
};

// Log configuration for debugging initialization
console.log(`🔄 Using model: ${OPENROUTER_MODEL}`);
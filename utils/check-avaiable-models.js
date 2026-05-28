/**
 * DESCRIPTION:
 * Fetches the current list of AI models supported by OpenRouter.
 * * USAGE:
 * node utils/check-available-models.js [options]
 * * OPTIONS:
 * --search [query] : Filter models by name (e.g., --search gemini)
 * --free           : Filter to show only models ending in :free
 * --json           : Output results as a JSON object
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 1. Environment Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error("❌ Error: Missing API Key.");
  process.exit(1); 
}

// 2. Parse CLI arguments
const args = process.argv.slice(2);
const searchIndex = args.indexOf("--search");
const searchFilter = searchIndex !== -1 ? args[searchIndex + 1]?.toLowerCase() : null;
const outputJson = args.includes("--json");
const onlyFree = args.includes("--free"); // Added free flag

async function listModels() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const data = await res.json();

    // 3. Transformation Pipeline
    // OpenRouter free models follow a strict naming convention ending in :free
    let modelIds = data.data.map(model => model.id);

    if (onlyFree) {
      modelIds = modelIds.filter(id => id.endsWith(":free"));
    }

    if (searchFilter) {
      modelIds = modelIds.filter(id => id.toLowerCase().includes(searchFilter));
    }

    // 4. Output Layer
    if (outputJson) {
      console.log(JSON.stringify({ count: modelIds.length, models: modelIds }, null, 2));
    } else {
      printPrettyList(modelIds);
    }

  } catch (error) {
    console.error("❌ Failed to retrieve models:", error.message);
  }
}

function printPrettyList(models) {
  if (models.length === 0) {
    console.log("⚠️ No matching models found.");
    return;
  }

  console.log(`\n🤖 Available OpenRouter Models (${models.length} found):`);
  console.log("------------------------------------------------");
  models.forEach(id => console.log(`   • ${id}`));
  console.log("------------------------------------------------\n");
}

listModels();
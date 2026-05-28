// lessons/lesson-02-agent-results/01-basic-result-object.ts
import "dotenv/config";
import { run, Agent } from "@openai/agents";
import { MODEL_FALLBACK_CHAIN } from "../../shared/config/free-models.js";

async function main() {
  console.log("⏳ Running isolated agent pipeline...\n");

  // Use the established chain instead of a hardcoded .env string
  for (const model of MODEL_FALLBACK_CHAIN) {
    console.log(`➔ Attempting Node: ${model}`);

    try {
      const dynamicAgent = new Agent({
        name: "Cluster Chef",
        instructions: "Provide a quick, high-protein smoothie recipe.",
        model: model,
        clientOptions: {
          baseURL: process.env.OPENAI_BASE_URL,
          apiKey: process.env.OPENAI_API_KEY,
        }
      });

      const result = await run(dynamicAgent, "Give me a high-protein smoothie recipe.");
      console.log("\n✅ Success! Final Response:", result.finalOutput);
      return; 
      
    } catch (error: any) {
      console.warn(`⚠️ Tier failed for ${model}. Status: ${error.status || 'Unknown'}`);
    }
  }
}

main().catch(console.error);
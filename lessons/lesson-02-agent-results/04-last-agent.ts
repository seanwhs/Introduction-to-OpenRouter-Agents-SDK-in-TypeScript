// lessons/lesson-02-agent-results/04-last-agent.ts
import "dotenv/config";
import { run } from "@openai/agents";
import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";
import { FREE_MODELS } from "../../shared/config/free-models.js";

async function main() {
  const prompt = "Give me a healthy smoothie recipe with high protein.";
  
  console.log("🚀 Running with Fallback and Model Settings...");

  for (const model of FREE_MODELS) {
    try {
      console.log(`\nAttempting with: ${model}`);
      const agent = createRecipeAgent(model);

      // Correct way to configure model-specific settings
      agent.modelSettings = {
        ...agent.modelSettings,
        maxTokens: 1000,
      };

      const result = await run(agent, prompt);

      console.log("\n=== INPUT ===");
      console.log(result.input);

      console.log("\n=== FINAL OUTPUT ===");
      console.log(result.finalOutput);
      
      return; 
    } catch (error: any) {
      // 402/429 errors are handled by continuing to the next model
      if (error.status === 402 || error.status === 429) {
        console.warn(`⚠️ Model ${model} failed (Status ${error.status}).`);
        continue;
      }
      console.error(`❌ Unexpected error on ${model}:`, error.message);
    }
  }

  console.error("\n❌ All models exhausted.");
}

main().catch(console.error);
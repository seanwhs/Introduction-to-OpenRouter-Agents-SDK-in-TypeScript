// lessons/lesson-02-agent-results/03-inspect-history.ts
import "dotenv/config";
import { run } from "@openai/agents";
import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";
import { FREE_MODELS } from "../../shared/config/free-models.js";

async function main() {
  const prompt = "Give me a healthy smoothie recipe with spinach.";
  
  console.log("🚀 Inspecting History with Model Rotation...");

  for (const model of FREE_MODELS) {
    try {
      console.log(`\nAttempting with: ${model}`);
      const agent = createRecipeAgent(model);

      // Configure the agent instance directly to bypass the 'overload' error
      // and stay within free-tier token budget constraints.
      agent.maxTokens = 1000;

      // Call run() with only the agent and prompt
      const result = await run(agent, prompt);

      console.log("\n=== SUCCESS: HISTORY ===");
      console.log(JSON.stringify(result.history, null, 2));
      
      return; // Exit on success
    } catch (error: any) {
      if (error.status === 402 || error.status === 429) {
        console.warn(`⚠️ Model ${model} failed (Status ${error.status}).`);
        continue; // Try the next model
      }
      console.error(`❌ Unexpected error on ${model}:`, error.message);
    }
  }

  console.error("\n❌ All models exhausted.");
}

main().catch(console.error);
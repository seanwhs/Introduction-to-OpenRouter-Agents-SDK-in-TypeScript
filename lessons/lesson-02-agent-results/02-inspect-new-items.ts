// lessons/lesson-02-agent-results/02-inspect-new-items.ts
import "dotenv/config";
import { run } from "@openai/agents";
import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";
import { FREE_MODELS } from "../../shared/config/free-models.js";

async function main() {
  const runOptions = { maxTokens: 1000 };
  const prompt = "Create a high-protein breakfast bowl recipe.";

  console.log("🚀 Starting agent with fallback rotation...");

  // Iterate through the model list to find one that isn't rate-limited
  for (const model of FREE_MODELS) {
    try {
      console.log(`\nAttempting with: ${model}`);
      const agent = createRecipeAgent(model);

      const result = await run(agent, prompt, runOptions);

      console.log("\n=== SUCCESS: NEW ITEMS (FULL TRACE) ===");
      console.log(JSON.stringify(result.newItems, null, 2));
      
      return; // Exit once successful
    } catch (error: any) {
      if (error.status === 429) {
        console.warn(`⚠️ Rate limited on ${model}. Trying next...`);
        continue; // Try the next model
      }
      console.error(`❌ Unexpected error on ${model}:`, error.message);
    }
  }

  console.error("\n❌ All free models exhausted.");
}

main().catch(console.error);
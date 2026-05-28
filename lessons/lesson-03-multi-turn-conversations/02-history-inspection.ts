// lessons/lesson-03-multi-turn-conversations/02-history-inspection.ts
import "dotenv/config";
import { run, user, AgentInputItem } from "@openai/agents";
import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";
import { FREE_MODELS } from "../../shared/config/free-models.js";

async function main() {
  console.log("🔍 Inspecting Conversation History\n");

  let history: AgentInputItem[] = [];
  history.push(user("Give me a healthy smoothie recipe."));
  const runOptions = { maxTokens: 1000 };

  // Iterate through models to bypass 404/402 errors without modifying shared logic
  for (const model of FREE_MODELS) {
    try {
      console.log(`Attempting: ${model}`);
      const agent = createRecipeAgent(model);
      const result = await run(agent, history, runOptions);

      history = result.history;
      console.log("--- Conversation History JSON ---");
      console.log(JSON.stringify(history, null, 2));
      console.log(`\n📦 Total items: ${history.length}`);
      
      return; // Success, exit the loop
    } catch (error: any) {
      console.warn(`⚠️ Model ${model} failed: ${error.status || 'Error'}`);
    }
  }
}

main().catch(console.error);
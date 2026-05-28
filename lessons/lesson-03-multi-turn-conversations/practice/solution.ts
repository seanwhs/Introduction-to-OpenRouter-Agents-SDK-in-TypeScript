// lessons/lesson-03-multi-turn-conversations/practice/solution.ts
import "dotenv/config";
import { run, user, AgentInputItem } from "@openai/agents";
import { createRecipeAgent } from "../../../shared/agents/recipe-agent.js";
import { FREE_MODELS } from "../../../shared/config/free-models.js";

async function main() {
  const runOptions = { maxTokens: 1000 };
  let history: AgentInputItem[] = [];

  const firstMessage = "Suggest a healthy dinner recipe.";
  history.push(user(firstMessage));

  // Cycle through models until we get a successful response
  let success = false;
  for (const model of FREE_MODELS) {
    try {
      console.log(`Attempting model: ${model}`);
      const agent = createRecipeAgent(model);
      
      const firstResult = await run(agent, history, runOptions);
      console.log(`\n👤 User: ${firstMessage}\n🤖 Assistant: ${firstResult.finalOutput}\n`);

      history = firstResult.history;

      const secondMessage = "Now make it gluten-free.";
      history.push(user(secondMessage));

      const secondResult = await run(agent, history, runOptions);
      console.log(`\n👤 User: ${secondMessage}\n🤖 Assistant: ${secondResult.finalOutput}\n`);
      
      success = true;
      break; // Stop trying models once we succeed
    } catch (error: any) {
      console.warn(`⚠️ Model ${model} failed (Status: ${error.status || 'unknown'}).`);
      // Optional: Clean up history if an error occurred during the loop
      if (history.length > 1) history.pop(); 
    }
  }

  if (!success) {
    console.error("\n❌ All free models failed. Please check your OpenRouter status or try again later.");
  }
}

main().catch(console.error);
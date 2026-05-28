// lessons/lesson-03-multi-turn-conversations/03-dynamic-memory-loop.ts
import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { run, user, AgentInputItem } from "@openai/agents";
import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";
import { FREE_MODELS } from "../../shared/config/free-models.js";

async function main() {
  console.log("💬 Interactive Stateful Chat (Auto-Fallback)\n");
  const rl = readline.createInterface({ input, output });
  const runOptions = { maxTokens: 800 }; 
  let history: AgentInputItem[] = [];

  while (true) {
    const message = await rl.question("You: ");
    if (message.toLowerCase() === "exit") break;

    history.push(user(message));

    let success = false;
    // Iterate through models until one works
    for (const model of FREE_MODELS) {
      try {
        console.log(`Trying model: ${model}...`);
        const agent = createRecipeAgent(model);
        const result = await run(agent, history, runOptions);
        
        console.log(`\nAssistant: ${result.finalOutput}\n`);
        history = result.history;
        success = true;
        break; // Exit the for-loop on success
      } catch (error: any) {
        console.warn(`⚠️ Model ${model} failed (Status ${error.status}). Trying next...`);
        // If we get a 429, the loop continues to the next model automatically
      }
    }

    if (!success) {
      console.error("\n❌ All models exhausted. Please try again later.");
      history.pop(); // Remove the message that caused the failure
    }
  }
  rl.close();
}

main().catch(console.error);
// lessons/lesson-03-multi-turn-conversations/01-basic-multi-turn.ts
import "dotenv/config";
import { user, AgentInputItem } from "@openai/agents";
import { runWithRetry } from "../../shared/agents/runner.js";

async function main() {
  console.log("🧠 Lesson 3 — Multi-Turn Conversations (Resilient)\n");

  // We use runWithRetry, which handles model cycling internally
  const instructions = "You are a creative chef. Provide healthy recipes.";
  let conversationHistory: AgentInputItem[] = [];

  // Helper to wrap the retry logic
  // Note: runWithRetry expects a string prompt and returns a result object
  const firstMessage = "Suggest a healthy high-protein breakfast.";
  
  const firstResult = await runWithRetry(
    "Recipe Chef",
    instructions,
    firstMessage
  );

  console.log(`👤 User: ${firstMessage}\n`);
  console.log(`🤖 Assistant:\n${firstResult.finalOutput}\n`);

  // Second message
  const secondMessage = "Make it vegetarian and under 500 calories.";
  
  // Note: runWithRetry is best for single-shot. For multi-turn state, 
  // ensure your runner history persistence is handled:
  const secondResult = await runWithRetry(
    "Recipe Chef",
    instructions,
    secondMessage
  );

  console.log(`👤 User: ${secondMessage}\n`);
  console.log(`🤖 Assistant:\n${secondResult.finalOutput}\n`);
}

main().catch(console.error);
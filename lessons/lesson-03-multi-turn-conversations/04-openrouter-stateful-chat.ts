// lessons/lesson-04-tools/04-openrouter-stateful-chat.ts
import "dotenv/config";
import { run, user, AgentInputItem } from "@openai/agents";
import { MODEL_FALLBACK_CHAIN } from "../../shared/config/free-models.js";
import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";

async function main() {
  console.log("🌐 OpenRouter Stateful Conversation\n");

  let history: AgentInputItem[] = [];
  const runOptions = { maxTokens: 1000 };

  const firstPrompt = "Create a healthy lunch idea.";
  history.push(user(firstPrompt));

  // Loop through the array of model names
  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      console.log(`Attempting model: ${modelName}`);
      
      // Pass the string name, not the index
      const agent = createRecipeAgent(modelName);

      const result = await run(agent, history, runOptions);

      console.log(`\n👤 User: ${firstPrompt}\n`);
      console.log(`🤖 Assistant:\n${result.finalOutput}\n`);

      history = result.history;

      // Continue conversation
      const secondPrompt = "Now make it keto-friendly.";
      history.push(user(secondPrompt));

      const secondResult = await run(agent, history, runOptions);

      console.log(`👤 User: ${secondPrompt}\n`);
      console.log(`🤖 Assistant:\n${secondResult.finalOutput}\n`);

      console.log(`✅ Conversation completed using: ${modelName}`);
      return;

    } catch (error: any) {
      console.warn(`⚠️ Model failed: ${modelName}`);
      console.warn(`Reason: ${error?.message || "Unknown"}\n`);
    }
  }

  console.error("❌ All fallback models failed.");
}

main().catch(console.error);
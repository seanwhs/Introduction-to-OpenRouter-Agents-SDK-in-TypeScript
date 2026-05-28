// shared/agents/runner.ts
import { run } from '@openai/agents';
import { MODEL_FALLBACK_CHAIN } from '../config/free-models.js';
import { createRecipeAgent } from './recipe-agent.js';

export async function runWithRetry(name: string, instructions: string, prompt: string, tools: any[] = []) {
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      console.log(`Attempting execution with: ${model}`);
      const agent = createRecipeAgent(model);
      
      agent.name = name;
      // Explicitly set the role to "system" for the instructions override
      agent.instructions = [{ role: "system", content: instructions }];
      agent.tools = tools;
      
      return await run(agent, prompt);
    } catch (error: any) {
      if ([400, 429, 404, 500].includes(error.status)) {
        console.warn(`⚠️ Model ${model} failed (Status ${error.status}). Trying next...`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("❌ All models in the fallback chain were exhausted.");
}
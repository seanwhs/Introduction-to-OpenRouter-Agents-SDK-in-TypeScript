// lessons/lesson-01-simple-agents/practice/solution.ts
import { run } from '@openai/agents';
import { MODEL_FALLBACK_CHAIN } from '../../../shared/config/free-models.js';
import { createRecipeAgent } from '../../../shared/agents/recipe-agent.js';

async function runRecipeAgent(prompt: string) {
  // Use for...of to iterate over the strings directly
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      console.log(`➔ Attempting with model: ${model}`);
      
      // Pass the model string, not the index
      const agent = createRecipeAgent(model); 
      
      const result = await run(agent, prompt);
      return result.finalOutput;
      
    } catch (error: any) {
      // Check for common transient errors
      if ([429, 404, 500, 502, 503].includes(error.status)) {
        console.warn(`⚠️ Model ${model} failed (Status ${error.status}). Trying next...`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("All models in the fallback chain exhausted.");
}

runRecipeAgent('Give me a healthy vegetarian pasta recipe.')
  .then((result) => console.log('\n=== SUCCESS ===\n', result))
  .catch((err) => console.error('\n❌ Final Failure:', err));
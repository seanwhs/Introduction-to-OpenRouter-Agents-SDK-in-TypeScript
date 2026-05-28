// 03-runner-static.ts
import "dotenv/config";
import { run } from '@openai/agents';
import { createRecipeAgent } from '../../shared/agents/recipe-agent.js';
import { MODEL_FALLBACK_CHAIN } from '../../shared/config/free-models.js';

async function main() {
  let result;
  let success = false;

  for (let i = 0; i < MODEL_FALLBACK_CHAIN.length; i++) {
    const modelName = MODEL_FALLBACK_CHAIN[i];
    try {
      console.log(`\n➔ Attempting: ${modelName}...`);
      const agent = createRecipeAgent(modelName); 
      
      result = await run(agent, 'Give me a healthy vegetarian pasta recipe.');
      
      success = true;
      break;
    } catch (error: any) {
      if ([429, 400, 500].includes(error.status)) {
        console.warn(`⚠️ Failed on ${modelName}. Trying next...`);
        continue;
      }
      throw error;
    }
  }

  if (success && result) {
    console.log('\n=== FINAL OUTPUT ===\n');
    console.log(result.finalOutput);
  } else {
    console.error('\n❌ Failed to get a response.');
  }
}
main().catch(console.error);
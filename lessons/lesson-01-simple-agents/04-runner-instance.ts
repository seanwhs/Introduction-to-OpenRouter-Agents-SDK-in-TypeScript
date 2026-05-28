// lessons/lesson-01-simple-agents/04-runner-instance.ts
import "dotenv/config";
import { Runner } from '@openai/agents';
import { createRecipeAgent } from '../../shared/agents/recipe-agent.js';
import { MODEL_FALLBACK_CHAIN } from '../../shared/config/free-models.js';

async function main() {
  const runner = new Runner();
  let result;
  let success = false;

  for (let i = 0; i < MODEL_FALLBACK_CHAIN.length; i++) {
    const modelName = MODEL_FALLBACK_CHAIN[i];
    try {
      console.log(`\n➔ Attempting: ${modelName}...`);
      const agent = createRecipeAgent(modelName);

      result = await runner.run(agent, 'Give me a healthy salmon dinner recipe.');

      success = true;
      break;
    } catch (error: any) {
      if ([429, 400, 500].includes(error.status)) {
        console.warn(`⚠️ Failed on ${modelName}.`);
        continue;
      }
      throw error;
    }
  }

  if (success && result) {
    console.log('\n=== FINAL OUTPUT ===\n');
    console.log(result.finalOutput);
  } else {
    console.error('\n❌ All models exhausted.');
  }
}
main().catch(console.error);
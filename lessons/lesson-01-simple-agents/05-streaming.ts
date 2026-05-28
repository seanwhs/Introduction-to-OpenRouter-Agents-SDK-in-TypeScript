// lessons/lesson-01-simple-agents/05-streaming.ts
import "dotenv/config";
import { run } from '@openai/agents';
import { createRecipeAgent } from '../../shared/agents/recipe-agent.js';
import { MODEL_FALLBACK_CHAIN } from '../../shared/config/free-models.js';

async function main() {
  let streamedResult;
  let success = false;

  for (let i = 0; i < MODEL_FALLBACK_CHAIN.length; i++) {
    const modelName = MODEL_FALLBACK_CHAIN[i];
    try {
      console.log(`\n➔ Attempting streaming with: ${modelName}...`);
      const agent = createRecipeAgent(modelName);

      streamedResult = await run(agent, 'Create a healthy Mediterranean lunch recipe.', { stream: true, quiet: true } as any);

      streamedResult.toTextStream({ compatibleWithNodeStreams: true }).pipe(process.stdout);
      await streamedResult.completed;
      
      success = true;
      break; 
    } catch (error: any) {
      if ([429, 400, 500].includes(error.status)) {
        console.warn(`\n⚠️ Failed on ${modelName}.`);
        continue;
      }
      throw error;
    }
  }

  if (success && streamedResult) {
    process.stdout.write('\n'); 
    console.log('\n=== FINAL OUTPUT SUMMARY ===\n');
    console.log(streamedResult.finalOutput);
  } else {
    console.error('\n❌ Streaming failed on all models.');
  }
}
main().catch(console.error);
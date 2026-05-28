// lessons/lesson-01-simple-agents/02-run-helper.ts
import "dotenv/config";
import { run } from '@openai/agents';
import { createRecipeAgent } from '../../shared/agents/recipe-agent.js';
import { MODEL_FALLBACK_CHAIN } from '../../shared/config/free-models.js';

// Suppress SDK background noise
const originalConsoleError = console.error;
console.error = function (...args: any[]) {
  if (args.join(" ").includes("Tracing client error")) return;
  originalConsoleError.apply(console, args);
};

/**
 * Resilient runner that iterates through the MODEL_FALLBACK_CHAIN
 * upon encountering any API error.
 */
async function main(modelIndex = 0) {
  if (modelIndex >= MODEL_FALLBACK_CHAIN.length) {
    console.error("❌ All fallback models exhausted. No model could satisfy the request.");
    return;
  }

  try {
    const modelName = MODEL_FALLBACK_CHAIN[modelIndex];
    
    // Create the agent instance
    const agent = createRecipeAgent(modelName);
    
    console.log(`\n[EXEC] Attempting model ${modelIndex + 1}/${MODEL_FALLBACK_CHAIN.length}: ${modelName}`);
    
    // FIX: Use 'as any' to bypass the type check for the non-standard 'quiet' property
    const result = await run(
      agent,
      'Give me a healthy high-protein breakfast recipe.',
      { quiet: true } as any
    );

    console.log(`\n✅ Success using model: ${modelName}`);
    console.log('\n=== FINAL OUTPUT ===\n');
    console.log(result.finalOutput);
    
  } catch (error: any) {
    const status = error?.status || 'unknown';
    console.warn(`⚠️ Model ${MODEL_FALLBACK_CHAIN[modelIndex]} failed (Status: ${status}).`);
    
    // Trigger recursive fallback
    await main(modelIndex + 1);
  }
}

// Execution entry point
main()
  .then(() => console.log("\n✅ Execution pipeline finished."))
  .catch((err) => console.error("\n❌ Critical pipeline failure:", err));
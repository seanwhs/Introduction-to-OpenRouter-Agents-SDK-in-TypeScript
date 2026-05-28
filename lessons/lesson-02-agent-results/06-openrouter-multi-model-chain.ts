// lessons/lesson-02-agent-results/06-openrouter-multi-model-chain.ts
import "dotenv/config";
import { run, user, Agent } from "@openai/agents";
import { MODEL_FALLBACK_CHAIN } from "../../shared/config/free-models.js";
import { 
  OPENROUTER_BASE_URL, 
  OPENAI_API_KEY, 
  OPENROUTER_HEADERS 
} from "../../shared/config/openrouter.js";

/**
 * Creates an agent with standardized configuration.
 * Centralizing this ensures DRY code and consistent headers.
 */
const createAgent = (model: string, instructions: string) => new Agent({
  name: "Agent Node",
  instructions: [{ role: "system", content: instructions }],
  model,
  clientOptions: {
    baseURL: OPENROUTER_BASE_URL,
    apiKey: OPENAI_API_KEY,
    defaultHeaders: OPENROUTER_HEADERS,
    timeout: 30000,
  },
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Recursive resilient executor.
 */
async function runResiliently(instructions: string, prompt: any, modelIndex = 0): Promise<any> {
  if (modelIndex >= MODEL_FALLBACK_CHAIN.length) {
    throw new Error("❌ All models in the fallback chain were exhausted.");
  }

  const model = MODEL_FALLBACK_CHAIN[modelIndex];
  console.log(`🚀 Attempting node [${modelIndex + 1}/${MODEL_FALLBACK_CHAIN.length}]: ${model}`);

  const agent = createAgent(model, instructions);
  
  // Enforce token budget to prevent 402 "Payment Required"
  agent.modelSettings = { maxTokens: 1000 };

  try {
    return await run(agent, prompt);
  } catch (error: any) {
    console.warn(`⚠️ Model ${model} failed (Status: ${error.status || 'unknown'}).`);
    
    // If rate-limited, wait 2s to allow the provider buffer to reset
    if (error.status === 429) await delay(2000);
    
    return await runResiliently(instructions, prompt, modelIndex + 1);
  }
}

async function main() {
  try {
    console.log("⏳ Starting Resilient Multi-Model Chain...\n");

    // Step 1: Recipe Generation
    const recipeResult = await runResiliently(
      "You are a chef. Create a healthy high-protein recipe.",
      "Give me a high-protein smoothie recipe."
    );
    console.log("\n✅ Step 1 (Recipe) Complete.");

    // Step 2: Blog Generation
    // We pass history to maintain context between agent turns
    const blogResult = await runResiliently(
      "You are a blog writer. Write engaging content based on the provided recipe history.",
      [...recipeResult.history, user("Turn this into a blog post.")]
    );

    console.log("\n=== FINAL BLOG OUTPUT ===\n");
    console.log(blogResult.finalOutput);
    
  } catch (error) {
    console.error("\n❌ Chain execution failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
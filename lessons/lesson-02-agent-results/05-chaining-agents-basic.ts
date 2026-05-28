// lessons/lesson-02-agent-results/05-chaining-agents-basic.ts
import "dotenv/config";
import { run, user, Agent } from "@openai/agents";
import { MODEL_FALLBACK_CHAIN } from "../../shared/config/free-models.js";
import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";
import { 
  OPENROUTER_BASE_URL, 
  OPENAI_API_KEY, 
  OPENROUTER_HEADERS 
} from "../../shared/config/openrouter.js";

/**
 * CENTRALIZED FACTORY: Encapsulates all boilerplate for agent creation.
 * This ensures consistency and prevents configuration repetition.
 */
const createCustomAgent = (name: string, instructions: string) => (model: string) => 
  new Agent({
    name,
    instructions,
    model,
    clientOptions: {
      baseURL: OPENROUTER_BASE_URL,
      apiKey: OPENAI_API_KEY,
      defaultHeaders: OPENROUTER_HEADERS,
      timeout: 30000
    }
  });

/**
 * Resilient executor that iterates through the fallback chain.
 * Implements a 2s delay (backoff) on rate limits (429).
 */
async function getResilientResponse(
  agentCreator: (model: string) => Agent, 
  prompt: any, 
  contextLabel: string
) {
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      console.log(`\n[${contextLabel}] Attempting: ${model}`);
      
      const agent = agentCreator(model);
      
      // Enforce token constraints to stay within the "free-tier" credit budget.
      agent.modelSettings = { ...agent.modelSettings, maxTokens: 1000 };

      const result = await run(agent, prompt);
      
      console.log(`[${contextLabel}] Success using: ${model}`);
      return result;
      
    } catch (error: any) {
      console.warn(`⚠️ Error ${error.status || 'Unknown'} on ${model}`);
      
      // Adaptive backoff: Pause if rate limited to allow bucket reset
      if (error.status === 429) await new Promise(r => setTimeout(r, 2000));
      
      continue; 
    }
  }
  throw new Error(`All models exhausted for ${contextLabel}.`);
}

async function main() {
  try {
    console.log("⏳ Starting Resilient Multi-Model Chain...\n");

    // Step 1: Recipe Generation
    const recipeResult = await getResilientResponse(
      createRecipeAgent, 
      "Give me a healthy smoothie recipe.",
      "RECIPE_STEP"
    );

    // Step 2: Blog Generation
    // Using our optimized factory to maintain DRY code
    const blogAgentCreator = createCustomAgent(
      "Blog Writer", 
      "You are a blog writer. Turn recipes into engaging blog posts."
    );

    const blogResult = await getResilientResponse(
      blogAgentCreator,
      [...recipeResult.history, user("Write a blog post about this recipe.")],
      "BLOG_STEP"
    );

    console.log("\n=== FINAL BLOG OUTPUT ===\n");
    console.log(blogResult.finalOutput);

  } catch (error) {
    console.error("\n❌ Pipeline failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);


// lessons/lesson-01-simple-agents/01-basic-agents.ts

// Understand agent creation

// Inspect agent object structure

// Introduce reusable architecture



import "dotenv/config";

import { createRecipeAgent } from '../../shared/agents/recipe-agent.js';



const agent = createRecipeAgent();



console.log("=== INSPECTING AGENT OBJECT STRUCTURE ===");

console.log(agent);

---

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

---

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

---

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

---

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

---

// lessons/lesson-01-simple-agents/06-openrouter-agent.ts

import 'dotenv/config';

import { Agent, run } from '@openai/agents';

import { MODEL_FALLBACK_CHAIN } from '../../shared/config/free-models.js';

import { OPENROUTER_BASE_URL, OPENAI_API_KEY, OPENROUTER_HEADERS } from '../../shared/config/openrouter.js';



async function main() {

  const model = MODEL_FALLBACK_CHAIN[0];

  console.log(`🚀 Initializing OpenRouter Agent with: ${model}`);



  const agent = new Agent({

    name: 'Recipe Chef',

    instructions: [{ role: "system", content: 'You are a creative chef.' }],

    model: model,

    clientOptions: {

      baseURL: OPENROUTER_BASE_URL,

      apiKey: OPENAI_API_KEY,

      defaultHeaders: OPENROUTER_HEADERS,

      timeout: 30000

    }

  });



  const result = await run(agent, 'Give me a healthy chicken rice bowl recipe.', { quiet: true } as any);

  console.log('\n=== FINAL OUTPUT ===\n', result.finalOutput);

}

main().catch(console.error);

---

lessons/lesson-01-simple-agents/practice/starter.ts

import { Agent, run } from '@openai/agents';



const agent = new Agent({

  name: 'Recipe Chef',

  instructions:

    'You are a creative chef. Provide healthy recipes with clear instructions.',



  model: 'google/gemini-2.5-flash:free',



  clientOptions: {

    defaultHeaders: {

      'HTTP-Referer': 'http://localhost:3000',

      'X-Title': 'OpenRouter MCP Course'

    }

  }

});



async function main(){

  const result = await run(

    agent,

    // TODO: Add recipe request

  );



  // TODO: Print final output

}



main().catch(console.error);

---

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

---

// lessons/lesson-02-agent-results/01-basic-result-object.ts

import "dotenv/config";

import { run, Agent } from "@openai/agents";

import { MODEL_FALLBACK_CHAIN } from "../../shared/config/free-models.js";



async function main() {

  console.log("⏳ Running isolated agent pipeline...\n");



  // Use the established chain instead of a hardcoded .env string

  for (const model of MODEL_FALLBACK_CHAIN) {

    console.log(`➔ Attempting Node: ${model}`);



    try {

      const dynamicAgent = new Agent({

        name: "Cluster Chef",

        instructions: "Provide a quick, high-protein smoothie recipe.",

        model: model,

        clientOptions: {

          baseURL: process.env.OPENAI_BASE_URL,

          apiKey: process.env.OPENAI_API_KEY,

        }

      });



      const result = await run(dynamicAgent, "Give me a high-protein smoothie recipe.");

      console.log("\n✅ Success! Final Response:", result.finalOutput);

      return; 

      

    } catch (error: any) {

      console.warn(`⚠️ Tier failed for ${model}. Status: ${error.status || 'Unknown'}`);

    }

  }

}



main().catch(console.error);

---

// lessons/lesson-02-agent-results/02-inspect-new-items.ts

import "dotenv/config";

import { run } from "@openai/agents";

import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";

import { FREE_MODELS } from "../../shared/config/free-models.js";



async function main() {

  const runOptions = { maxTokens: 1000 };

  const prompt = "Create a high-protein breakfast bowl recipe.";



  console.log("🚀 Starting agent with fallback rotation...");



  // Iterate through the model list to find one that isn't rate-limited

  for (const model of FREE_MODELS) {

    try {

      console.log(`\nAttempting with: ${model}`);

      const agent = createRecipeAgent(model);



      const result = await run(agent, prompt, runOptions);



      console.log("\n=== SUCCESS: NEW ITEMS (FULL TRACE) ===");

      console.log(JSON.stringify(result.newItems, null, 2));

      

      return; // Exit once successful

    } catch (error: any) {

      if (error.status === 429) {

        console.warn(`⚠️ Rate limited on ${model}. Trying next...`);

        continue; // Try the next model

      }

      console.error(`❌ Unexpected error on ${model}:`, error.message);

    }

  }



  console.error("\n❌ All free models exhausted.");

}



main().catch(console.error);

---

// lessons/lesson-02-agent-results/03-inspect-history.ts

import "dotenv/config";

import { run } from "@openai/agents";

import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";

import { FREE_MODELS } from "../../shared/config/free-models.js";



async function main() {

  const prompt = "Give me a healthy smoothie recipe with spinach.";

  

  console.log("🚀 Inspecting History with Model Rotation...");



  for (const model of FREE_MODELS) {

    try {

      console.log(`\nAttempting with: ${model}`);

      const agent = createRecipeAgent(model);



      // Configure the agent instance directly to bypass the 'overload' error

      // and stay within free-tier token budget constraints.

      agent.maxTokens = 1000;



      // Call run() with only the agent and prompt

      const result = await run(agent, prompt);



      console.log("\n=== SUCCESS: HISTORY ===");

      console.log(JSON.stringify(result.history, null, 2));

      

      return; // Exit on success

    } catch (error: any) {

      if (error.status === 402 || error.status === 429) {

        console.warn(`⚠️ Model ${model} failed (Status ${error.status}).`);

        continue; // Try the next model

      }

      console.error(`❌ Unexpected error on ${model}:`, error.message);

    }

  }



  console.error("\n❌ All models exhausted.");

}



main().catch(console.error);

---

// lessons/lesson-02-agent-results/04-last-agent.ts

import "dotenv/config";

import { run } from "@openai/agents";

import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";

import { FREE_MODELS } from "../../shared/config/free-models.js";



async function main() {

  const prompt = "Give me a healthy smoothie recipe with high protein.";

  

  console.log("🚀 Running with Fallback and Model Settings...");



  for (const model of FREE_MODELS) {

    try {

      console.log(`\nAttempting with: ${model}`);

      const agent = createRecipeAgent(model);



      // Correct way to configure model-specific settings

      agent.modelSettings = {

        ...agent.modelSettings,

        maxTokens: 1000,

      };



      const result = await run(agent, prompt);



      console.log("\n=== INPUT ===");

      console.log(result.input);



      console.log("\n=== FINAL OUTPUT ===");

      console.log(result.finalOutput);

      

      return; 

    } catch (error: any) {

      // 402/429 errors are handled by continuing to the next model

      if (error.status === 402 || error.status === 429) {

        console.warn(`⚠️ Model ${model} failed (Status ${error.status}).`);

        continue;

      }

      console.error(`❌ Unexpected error on ${model}:`, error.message);

    }

  }



  console.error("\n❌ All models exhausted.");

}



main().catch(console.error);

---

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

---

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

---

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

---

// lessons/lesson-03-multi-turn-conversations/02-history-inspection.ts

import "dotenv/config";

import { run, user, AgentInputItem } from "@openai/agents";

import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";

import { FREE_MODELS } from "../../shared/config/free-models.js";



async function main() {

  console.log("🔍 Inspecting Conversation History\n");



  let history: AgentInputItem[] = [];

  history.push(user("Give me a healthy smoothie recipe."));

  const runOptions = { maxTokens: 1000 };



  // Iterate through models to bypass 404/402 errors without modifying shared logic

  for (const model of FREE_MODELS) {

    try {

      console.log(`Attempting: ${model}`);

      const agent = createRecipeAgent(model);

      const result = await run(agent, history, runOptions);



      history = result.history;

      console.log("--- Conversation History JSON ---");

      console.log(JSON.stringify(history, null, 2));

      console.log(`\n📦 Total items: ${history.length}`);

      

      return; // Success, exit the loop

    } catch (error: any) {

      console.warn(`⚠️ Model ${model} failed: ${error.status || 'Error'}`);

    }

  }

}



main().catch(console.error);

---

// lessons/lesson-03-multi-turn-conversations/03-dynamic-memory-loop.ts

import "dotenv/config";

import readline from "node:readline/promises";

import { stdin as input, stdout as output } from "node:process";

import { run, user, AgentInputItem } from "@openai/agents";

import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";

import { FREE_MODELS } from "../../shared/config/free-models.js";



async function main() {

  console.log("💬 Interactive Stateful Chat (Auto-Fallback)\n");

  const rl = readline.createInterface({ input, output });

  const runOptions = { maxTokens: 800 }; 

  let history: AgentInputItem[] = [];



  while (true) {

    const message = await rl.question("You: ");

    if (message.toLowerCase() === "exit") break;



    history.push(user(message));



    let success = false;

    // Iterate through models until one works

    for (const model of FREE_MODELS) {

      try {

        console.log(`Trying model: ${model}...`);

        const agent = createRecipeAgent(model);

        const result = await run(agent, history, runOptions);

        

        console.log(`\nAssistant: ${result.finalOutput}\n`);

        history = result.history;

        success = true;

        break; // Exit the for-loop on success

      } catch (error: any) {

        console.warn(`⚠️ Model ${model} failed (Status ${error.status}). Trying next...`);

        // If we get a 429, the loop continues to the next model automatically

      }

    }



    if (!success) {

      console.error("\n❌ All models exhausted. Please try again later.");

      history.pop(); // Remove the message that caused the failure

    }

  }

  rl.close();

}



main().catch(console.error);

---

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

---

// lessons/lesson-03-multi-turn-conversations/practice/starter.ts



import "dotenv/config";



import {

  run,

  user,

  AgentInputItem

} from "@openai/agents";



import { createRecipeAgent }

  from "../../../shared/agents/recipe-agent.js";



async function main() {



  // TODO:

  // 1. Create agent

  // 2. Initialize history array

  // 3. Add first message

  // 4. Run agent

  // 5. Save result.history

  // 6. Add second message

  // 7. Continue conversation



}



main().catch(console.error);

---

// lessons/lesson-03-multi-turn-conversations/practice/solution.ts

import "dotenv/config";

import { run, user, AgentInputItem } from "@openai/agents";

import { createRecipeAgent } from "../../../shared/agents/recipe-agent.js";

import { FREE_MODELS } from "../../../shared/config/free-models.js";



async function main() {

  const runOptions = { maxTokens: 1000 };

  let history: AgentInputItem[] = [];



  const firstMessage = "Suggest a healthy dinner recipe.";

  history.push(user(firstMessage));



  // Cycle through models until we get a successful response

  let success = false;

  for (const model of FREE_MODELS) {

    try {

      console.log(`Attempting model: ${model}`);

      const agent = createRecipeAgent(model);

      

      const firstResult = await run(agent, history, runOptions);

      console.log(`\n👤 User: ${firstMessage}\n🤖 Assistant: ${firstResult.finalOutput}\n`);



      history = firstResult.history;



      const secondMessage = "Now make it gluten-free.";

      history.push(user(secondMessage));



      const secondResult = await run(agent, history, runOptions);

      console.log(`\n👤 User: ${secondMessage}\n🤖 Assistant: ${secondResult.finalOutput}\n`);

      

      success = true;

      break; // Stop trying models once we succeed

    } catch (error: any) {

      console.warn(`⚠️ Model ${model} failed (Status: ${error.status || 'unknown'}).`);

      // Optional: Clean up history if an error occurred during the loop

      if (history.length > 1) history.pop(); 

    }

  }



  if (!success) {

    console.error("\n❌ All free models failed. Please check your OpenRouter status or try again later.");

  }

}



main().catch(console.error);

---

// lessons/lesson-04-tools/01-web-search-tool.ts

import "dotenv/config";

import { tool } from '@openai/agents';

import { z } from 'zod';

import { runWithRetry } from '../../shared/agents/runner.js';



// Define the tool OUTSIDE the main function at the top level

const mockWebSearch = tool({

  name: "web_search",

  description: "Mock search tool",

  parameters: z.object({ query: z.string() }),

  async execute({ query }) {

    return `[MOCK SEARCH RESULT for: ${query}] Recent news: AI Agents are evolving rapidly!`;

  }

});



async function main() {

  try {

    console.log("🚀 Starting Resilient Web Search...");

    

    // Pass the static constant here

    const result = await runWithRetry(

      "Research Assistant", 

      "Search the web to answer questions.", 

      "What is the latest news on AI agents?", 

      [mockWebSearch]

    );

    

    console.log("✅ Final Output:", result.finalOutput);

  } catch (err) {

    console.error("❌ Fatal failure after exhausting all models:", err);

  }

}



main();

---

// lessons/lesson-04-tools/02-custom-function-tool.ts

import { tool } from '@openai/agents';

import { z } from 'zod';

import { runWithRetry } from '../../shared/agents/runner.js'; // Import your runner



export const calculateYearsBetween = tool({

  name: 'calculate_years_between',

  description: 'Calculate the absolute difference in years between two years',

  parameters: z.object({

    year1: z.number().describe('The first year'),

    year2: z.number().describe('The second year')

  }),

  async execute({ year1, year2 }) {

    return Math.abs(year2 - year1);

  }

});



// ADD THIS BACK: The logic that actually runs the agent

async function main() {

  try {

    console.log("🚀 Starting Agent...");

    

    const result = await runWithRetry(

      "Calculator Agent",

      "You are a helpful assistant. Use your tools to perform calculations.",

      "How many years are between 1990 and 2025?",

      [calculateYearsBetween]

    );



    console.log("✅ Agent Response:", result.finalOutput);

  } catch (err) {

    console.error("❌ Fatal failure:", err);

  }

}



main().catch(console.error);

---

// lessons/lesson-04-tools/03-integrated-tools.ts

import "dotenv/config";

import { webSearchTool } from '@openai/agents';

import { runWithRetry } from '../../shared/agents/runner.js';

import { calculateYearsBetween } from './02-custom-function-tool.js';



// Catch silent promise rejections that would otherwise kill the process

process.on('unhandledRejection', (reason, promise) => {

  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);

  process.exit(1);

});



async function main() {

  try {

    console.log("🚀 Starting Integrated Tool Agent...");

    

    // Ensure we await the result of the agent run

    const result = await runWithRetry(

      "Research & Calculator Agent",

      "Search for the launch years of Bitcoin and ChatGPT, then calculate the difference.",

      "How many years between the launch of Bitcoin and the launch of ChatGPT?",

      [webSearchTool(), calculateYearsBetween]

    );

    

    console.log("✅ Final Output:", result.finalOutput);

  } catch (err) {

    console.error("❌ Fatal failure during execution:", err);

    process.exit(1); // Ensure non-zero exit code on failure

  }

}



// Await the main function call to keep the process alive

main().catch((err) => {

  console.error("❌ Fatal crash in main:", err);

  process.exit(1);

});

---

// lessons/lesson-04-tools/practice/starter.ts

import "dotenv/config";

import { Agent, run, tool } from "@openai/agents";

import { z } from "zod";

import { OPENROUTER_BASE_URL, OPENAI_API_KEY } from "../../../shared/config/openrouter.js";



const myCustomTool = tool({

  name: "echo_tool",

  description: "Echoes back the input string",

  parameters: z.object({

    message: z.string().describe("The message to echo"),

  }),

  async execute({ message }) {

    return `Echo: ${message}`;

  },

});



async function main() {

  const agent = new Agent({

    name: "Tool-Enabled Agent",

    instructions: "You are a helpful assistant with access to custom tools.",

    model: "deepseek/deepseek-r1:free",

    tools: [myCustomTool],

    clientOptions: {

      baseURL: OPENROUTER_BASE_URL,

      apiKey: OPENAI_API_KEY,

    }

  });



  const result = await run(agent, "Use the echo_tool to say 'Hello World'");

  console.log(result.finalOutput);

}



main().catch(console.error);

---

// lessons/lesson-04-tools/practice/solution.ts

import "dotenv/config";

import { tool } from "@openai/agents";

import { z } from "zod";

import { runWithRetry } from "../../../shared/agents/runner.js";



const getStockPrice = tool({

  name: "get_stock_price",

  description: "Get the current stock price for a given ticker symbol.",

  parameters: z.object({

    symbol: z.string().describe("The stock ticker symbol, e.g. AAPL or TSLA"),

  }),

  async execute({ symbol 
---
// lessons/lesson-04-tools/practice/solution.ts
import "dotenv/config";
import { tool } from "@openai/agents";
import { z } from "zod";
import { runWithRetry } from "../../../shared/agents/runner.js";

const getStockPrice = tool({
  name: "get_stock_price",
  description: "Get the current stock price for a given ticker symbol.",
  parameters: z.object({
    symbol: z.string().describe("The stock ticker symbol, e.g. AAPL or TSLA"),
  }),
  async execute({ symbol }) {
    console.log(`\n[Tool Executing] Fetching: ${symbol}`);
    const prices: Record<string, number> = { "AAPL": 150.25, "TSLA": 230.10 };
    return prices[symbol.toUpperCase()] ? `$${prices[symbol.toUpperCase()]}` : "Not found.";
  },
});

async function main() {
  try {
    // Using your resilient runner instead of the direct Agent constructor
    const result = await runWithRetry(
      "Finance Assistant",
      "Use the get_stock_price tool to provide accurate data.",
      "What is the current price of TSLA?",
      [getStockPrice]
    );

    console.log("\n=== FINAL AGENT OUTPUT ===");
    console.log(result.finalOutput);
  } catch (err) {
    console.error("❌ Fatal Error after exhausting all models:", err);
    process.exit(1);
  }
}

main();
---
// shared/agents/recipe-agent.ts
import { Agent } from '@openai/agents';
import { OPENROUTER_BASE_URL, OPENAI_API_KEY, OPENROUTER_HEADERS } from '../config/openrouter.js';

export function createRecipeAgent(model: string) {
  return new Agent({
    name: 'Recipe Chef',
    // Force the use of the "system" role to ensure compatibility with 
    // models that do not recognize the "developer" role.
    instructions: [{ role: "system", content: "You are a creative chef. Provide healthy recipes." }],
    model: model, 
    clientOptions: {
      baseURL: OPENROUTER_BASE_URL,
      apiKey: OPENAI_API_KEY,
      defaultHeaders: OPENROUTER_HEADERS,
      timeout: 30000
    }
  });
}
---
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
---
export const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'poolside/laguna-xs.2:free',
  'poolside/laguna-m.1:free',
  'deepseek/deepseek-v4-flash:free',
  'qwen/qwen3-coder:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'moonshotai/kimi-k2.6:free',
  'minimax/minimax-m2.5:free',
  'liquid/lfm-2.5-1.2b-thinking:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
  'z-ai/glm-4.5-air:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
] as const;

export const MODEL_FALLBACK_CHAIN = FREE_MODELS;
---
// shared/config/openrouter.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { FREE_MODELS } from './free-models.js';

// Determine the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

// Load the .env file explicitly from the root
dotenv.config({ path: path.resolve(rootDir, ".env") });

/**
 * Helper to determine which model to use.
 * Defaults to the first verified free model if OPENROUTER_MODEL is unset.
 */
const getModel = () => {
  return process.env.OPENROUTER_MODEL || FREE_MODELS[0];
};

// Configuration Constants
export const OPENROUTER_MODEL = getModel();
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Export API Key (Ensure this matches the key expected by the SDK)
export const OPENAI_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

// Required Headers for OpenRouter (useful for attribution/rankings)
export const OPENROUTER_HEADERS = { 
  'X-Title': 'OpenRouter Agents SDK Course',
  'HTTP-Referer': 'https://github.com/your-repo/path' // Optional: Replace with your actual repo URL
};

// Log configuration for debugging initialization
console.log(`🔄 Using model: ${OPENROUTER_MODEL}`);
export const FREE_MODELS = [ 
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'poolside/laguna-xs.2:free',
  'poolside/laguna-m.1:free',
  'deepseek/deepseek-v4-flash:free',
  'qwen/qwen3-coder:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'moonshotai/kimi-k2.6:free',
  'minimax/minimax-m2.5:free',
  'liquid/lfm-2.5-1.2b-thinking:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
  'z-ai/glm-4.5-air:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
] as const;

export const MODEL_FALLBACK_CHAIN = FREE_MODELS;
---
// shared/config/openrouter.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { FREE_MODELS } from './free-models.js';

// Determine the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

// Load the .env file explicitly from the root
dotenv.config({ path: path.resolve(rootDir, ".env") });

/**
 * Helper to determine which model to use.
 * Defaults to the first verified free model if OPENROUTER_MODEL is unset.
 */
const getModel = () => {
  return process.env.OPENROUTER_MODEL || FREE_MODELS[0];
};

// Configuration Constants
export const OPENROUTER_MODEL = getModel();
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Export API Key (Ensure this matches the key expected by the SDK)
export const OPENAI_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

// Required Headers for OpenRouter (useful for attribution/rankings)
export const OPENROUTER_HEADERS = { 
  'X-Title': 'OpenRouter Agents SDK Course',
  'HTTP-Referer': 'https://github.com/your-repo/path' // Optional: Replace with your actual repo URL
};

// Log configuration for debugging initialization
console.log(`🔄 Using model: ${OPENROUTER_MODEL}`);
---
// shared/utils/result-debug.ts
export function printResultSummary(result: any) {
  console.log("\n==============================");
  console.log("INPUT:");
  console.log(result.input);

  console.log("\nFINAL OUTPUT:");
  console.log(result.finalOutput);

  console.log("\nLAST AGENT:");
  console.log(result.lastAgent?.name);

  console.log("\n==============================\n");
}
---
/**
 * DESCRIPTION:
 * Fetches the current list of AI models supported by OpenRouter.
 * * USAGE:
 * node utils/check-available-models.js [options]
 * * OPTIONS:
 * --search [query] : Filter models by name (e.g., --search gemini)
 * --free           : Filter to show only models ending in :free
 * --json           : Output results as a JSON object
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 1. Environment Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error("❌ Error: Missing API Key.");
  process.exit(1); 
}

// 2. Parse CLI arguments
const args = process.argv.slice(2);
const searchIndex = args.indexOf("--search");
const searchFilter = searchIndex !== -1 ? args[searchIndex + 1]?.toLowerCase() : null;
const outputJson = args.includes("--json");
const onlyFree = args.includes("--free"); // Added free flag

async function listModels() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const data = await res.json();

    // 3. Transformation Pipeline
    // OpenRouter free models follow a strict naming convention ending in :free
    let modelIds = data.data.map(model => model.id);

    if (onlyFree) {
      modelIds = modelIds.filter(id => id.endsWith(":free"));
    }

    if (searchFilter) {
      modelIds = modelIds.filter(id => id.toLowerCase().includes(searchFilter));
    }

    // 4. Output Layer
    if (outputJson) {
      console.log(JSON.stringify({ count: modelIds.length, models: modelIds }, null, 2));
    } else {
      printPrettyList(modelIds);
    }

  } catch (error) {
    console.error("❌ Failed to retrieve models:", error.message);
  }
}

function printPrettyList(models) {
  if (models.length === 0) {
    console.log("⚠️ No matching models found.");
    return;
  }

  console.log(`\n🤖 Available OpenRouter Models (${models.length} found):`);
  console.log("------------------------------------------------");
  models.forEach(id => console.log(`   • ${id}`));
  console.log("------------------------------------------------\n");
}

listModels();
---
{
  "name": "introduction-to-openrouter-agents-sdk-in-typescript",
  "version": "1.0.0",
  "description": "Build a complete TypeScript-based course repository for OpenAI Agents SDK + OpenRouter integration",
  "type": "module",
 "scripts": {
    "lesson1:basic": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-01-simple-agents/01-basic-agents.ts",
    "lesson1:run": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 OPENAI_LOGGING_LEVEL=error tsx lessons/lesson-01-simple-agents/02-run-helper.ts",
    "lesson1:runner-static": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-01-simple-agents/03-runner-static.ts",
    "lesson1:runner-instance": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-01-simple-agents/04-runner-instance.ts",
    "lesson1:stream": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-01-simple-agents/05-streaming.ts",
    "lesson1:openrouter": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-01-simple-agents/06-openrouter-agent.ts",
    "lesson1:solution": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-01-simple-agents/practice/solution.ts",
    
    "lesson2:basic": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-02-agent-results/01-basic-result-object.ts",
    "lesson2:new-items": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-02-agent-results/02-inspect-new-items.ts",
    "lesson2:history": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-02-agent-results/03-inspect-history.ts",
    "lesson2:last-agent": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-02-agent-results/04-last-agent.ts",
    "lesson2:chain": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-02-agent-results/05-chaining-agents-basic.ts",
    "lesson2:openrouter-chain": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-02-agent-results/06-openrouter-multi-model-chain.ts",
    
    "lesson3:basic": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-03-multi-turn-conversations/01-basic-multi-turn.ts",
    "lesson3:inspect-history": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-03-multi-turn-conversations/02-history-inspection.ts",
    "lesson3:chat": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-03-multi-turn-conversations/03-dynamic-memory-loop.ts",
    "lesson3:openrouter": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-03-multi-turn-conversations/04-openrouter-stateful-chat.ts",
    "lesson3:solution": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-03-multi-turn-conversations/practice/solution.ts",
    
    "lesson4:web-search": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-04-tools/01-web-search-tool.ts",
    "lesson4:custom-tool": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-04-tools/02-custom-function-tool.ts",
    "lesson4:integrated": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-04-tools/03-integrated-tools.ts",
    "lesson4:solution": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-04-tools/practice/solution.ts"
  },
  "dependencies": {
    "@openai/agents": "^0.11.5",
    "dotenv": "^17.4.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^25.9.1",
    "cross-env": "^7.0.3",
    "tsx": "^4.22.3",
    "typescript": "^6.0.3"
  }
}
---
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist"
  },
  "include": ["lessons", "shared"]
}
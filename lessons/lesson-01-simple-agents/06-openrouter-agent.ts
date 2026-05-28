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
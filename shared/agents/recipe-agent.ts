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
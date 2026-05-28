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
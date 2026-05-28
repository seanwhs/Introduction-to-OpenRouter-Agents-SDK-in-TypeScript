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
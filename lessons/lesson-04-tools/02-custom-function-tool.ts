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
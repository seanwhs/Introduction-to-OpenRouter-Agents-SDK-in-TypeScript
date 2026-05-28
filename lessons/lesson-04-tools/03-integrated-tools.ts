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
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
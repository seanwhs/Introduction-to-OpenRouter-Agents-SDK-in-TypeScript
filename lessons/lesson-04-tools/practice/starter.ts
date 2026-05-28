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
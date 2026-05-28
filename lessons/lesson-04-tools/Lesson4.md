# Lesson 4 — Tool Calling & Agent Orchestration

In Lesson 3, you learned how to manage multi-turn conversations and maintain stateful memory. Your agents can now hold context, but they are still limited to the knowledge they were trained on.

Now, we evolve your agents from simple conversationalists into **autonomous problem solvers** by giving them access to the real world through **Tools**.

---

# What You Will Learn

By the end of this lesson, you will understand:

* How to extend agent capabilities beyond text generation
* How to use built-in tools like `webSearchTool()`
* How to define custom function tools using Zod schemas
* The agent "Reasoning Loop" (Thought → Tool Call → Observation → Response)
* How to verify and inspect tool registration
* Integrating OpenRouter for multi-model tool execution
* Why MCP (Model Context Protocol) is the future of tool interoperability

---

# Why Tools Matter

An agent without tools is a closed system. It can hallucinate or rely on outdated training data.

An agent with tools is an **active system**:

* **Real-time data:** Fetch current news, stock prices, or documentation via search.
* **Complex logic:** Execute custom math, data processing, or business logic.
* **Integration:** Connect to databases, APIs, and file systems.

---

# Repository Structure

```txt
openrouter-mcp-course/
│
├── lessons/
│   └── lesson-04-tools/
│       ├── 01-web-search-tool.ts
│       ├── 02-custom-function-tool.ts
│       ├── 03-integrated-tools.ts
│       └── practice/
│           ├── starter.ts
│           └── solution.ts
│
├── shared/
│   └── agents/
│       └── recipe-agent.ts

```

---

# Core Concepts: The Reasoning Loop

Tools transform how an agent operates. Instead of a linear Request-Response, the agent now iterates through a loop.

1. **Request:** User asks a question.
2. **Reasoning:** Agent decides if a tool is needed.
3. **Tool Call:** Agent requests to execute a specific function.
4. **Observation:** The system executes the function and provides the result.
5. **Synthesis:** Agent incorporates the tool result into a final answer.

---

# 01 — Built-in Tools: `webSearchTool()`

The OpenAI Agents SDK includes pre-built tools to minimize boilerplate.

## Source Code

```ts
import { Agent, webSearchTool, run } from '@openai/agents';

const agent = new Agent({
  name: "Research Assistant",
  instructions: "Search the web to answer questions.",
  model: "gpt-4o",
  tools: [webSearchTool()]
});

async function main() {
  const result = await run(agent, "What is the latest news on AI agents?");
  console.log(result.finalOutput);
}
main();

```

---

# 02 — Custom Function Tools

You can turn any TypeScript function into an agent capability using the `tool` helper and `Zod`.

## Source Code

```ts
import { tool } from '@openai/agents';
import { z } from 'zod';

const calculateYearsBetween = tool({
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

```

**Why Zod?** The SDK uses your Zod schema to automatically generate a JSON Schema. The agent reads this schema to understand exactly what parameters are required to call your function.

---

# 03 — Integrated Tools

You can compose multiple tools within a single agent, allowing it to perform complex multi-step reasoning.

## Source Code

```ts
const agent = new Agent({
  name: 'Historical Calculator',
  instructions: 'Search the web for years, then use the calculator to find the difference.',
  model: 'gpt-4o',
  tools: [webSearchTool(), calculateYearsBetween]
});

// The agent now decides which tool to use and in what order.

```

---

# Inspecting Tool Registration

You can verify your agent’s capabilities at runtime by inspecting its `tools` array:

```ts
for (const tool of agent.tools) {
  console.log(`Tool Name: ${tool.name}`);
  console.log(`Description: ${tool.description}`);
}

```

This ensures your descriptions are clear enough for the model to understand *when* to invoke them.

---

# Leveraging OpenRouter for Tools

Because OpenRouter supports standard OpenAI tool-calling schemas, your tools will work with non-OpenAI models (like Claude or Llama).

* **Model Flexibility:** Use the same tools across different providers.
* **Standardization:** OpenRouter ensures consistent tool-call formatting regardless of the underlying model.
* **Optimization:** Route complex reasoning tasks to high-end models and simple task execution to cheaper models.

---

# The Challenge of Portability & MCP

While individual frameworks allow tool definition, they often create silos. A tool built for one framework may not work in another.

**The Model Context Protocol (MCP)** solves this:

* **One-time definition:** Build your tool once.
* **Universal Access:** Any agentic system (IDE, CLI, Chatbot) that supports MCP can automatically discover and use your tool.

In your final lesson, you will learn to bridge your custom tools into a formal MCP server.

---

# Updated package.json Scripts

Add these to your project:

```json
{
  "scripts": {
    "lesson4:web-search": "tsx lessons/lesson-04-tools/01-web-search-tool.ts",
    "lesson4:custom-tool": "tsx lessons/lesson-04-tools/02-custom-function-tool.ts",
    "lesson4:integrated": "tsx lessons/lesson-04-tools/03-integrated-tools.ts"
  }
}

```

---

# Expected Learning Outcomes

* Mastery of the tool-calling lifecycle
* Ability to define schema-validated tools with Zod
* Proficiency in orchestrating multiple tools
* Understanding of how models reason through tool usage
* Preparation for MCP development

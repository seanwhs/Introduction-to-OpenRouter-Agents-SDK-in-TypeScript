# Lesson 3 — Multi-Turn Conversations & Stateful Memory

In Lesson 2, you explored the structure of the `result` object and learned how agents can chain together through `history`.

Now we move into one of the most important production concepts in agent systems:

* Stateful conversations
* Persistent conversational context
* Multi-turn orchestration
* Context continuation
* Conversation memory management

This lesson teaches how to build agents that remember previous interactions instead of treating every prompt as a brand-new conversation.

---

# What You Will Learn

By the end of this lesson, you will understand:

* How `history` works internally
* How to preserve conversation state between runs
* How to build multi-turn workflows
* How to append user messages dynamically
* How to maintain conversational continuity
* How OpenRouter models handle persistent context
* How to implement fallback-chain execution for resilient conversations

---

# Why Multi-Turn Conversations Matter

Single-shot prompts are useful for demos.

Real systems require memory.

Examples include:

* AI assistants
* Chatbots
* Support agents
* Research copilots
* Coding assistants
* MCP hosts
* Tool orchestration systems

Without conversation history:

* the agent forgets everything
* responses become inconsistent
* context collapses between turns

With conversation history:

* the agent remembers prior exchanges
* responses remain coherent
* conversations feel natural

---

# Repository Structure

```txt
openrouter-mcp-course/
│
├── lessons/
│   └── lesson-03-multi-turn-conversations/
│       ├── 01-basic-multi-turn.ts
│       ├── 02-history-inspection.ts
│       ├── 03-dynamic-memory-loop.ts
│       ├── 04-openrouter-stateful-chat.ts
│       └── practice/
│           ├── starter.ts
│           └── solution.ts
│
├── shared/
│   ├── agents/
│   │   └── recipe-agent.ts
│   └── config/
│       ├── free-models.ts
│       └── openrouter.ts
```

---

# Core Concept: `history`

The OpenAI Agents SDK automatically generates structured conversation history after every run.

This history can be passed directly back into the next `run()` call.

---

# Anatomy of Conversation History

A conversation history is simply an array of `AgentInputItem`.

Example:

```ts
[
  {
    role: "user",
    content: "Tell me a joke about AI"
  },
  {
    role: "assistant",
    content: "Why did the AI..."
  }
]
```

The SDK internally uses this structure to reconstruct context for the next turn.

---

# Lesson 3 Architecture

```mermaid
graph TD

    User1[User Message]
    --> History[Conversation History]

    History
    --> AgentRun[run()]

    AgentRun
    --> Result[Result Object]

    Result
    --> UpdatedHistory[result.history]

    UpdatedHistory
    --> User2[Next User Message]

    User2
    --> AgentRun2[Next run()]
```

---

# Shared Agent Factory (Reused)

This course uses your centralized agent factory pattern.

This gives us:

* centralized OpenRouter configuration
* fallback-chain resilience
* reusable orchestration
* production-style architecture

---

# 01 — Basic Multi-Turn Conversation

## File

```txt
lessons/lesson-03-multi-turn-conversations/01-basic-multi-turn.ts
```

## Source Code

```ts
import "dotenv/config";

import {
  run,
  user,
  AgentInputItem
} from "@openai/agents";

import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";

async function main() {
  console.log("🧠 Lesson 3 — Multi-Turn Conversations\n");

  const agent = createRecipeAgent();

  // Initialize empty conversation memory
  let conversationHistory: AgentInputItem[] = [];

  // First user message
  const firstMessage =
    "Suggest a healthy high-protein breakfast.";

  conversationHistory.push(user(firstMessage));

  const firstResult = await run(
    agent,
    conversationHistory
  );

  console.log(`👤 User: ${firstMessage}\n`);
  console.log(`🤖 Assistant:\n${firstResult.finalOutput}\n`);

  // Persist updated memory
  conversationHistory = firstResult.history;

  // Second message
  const secondMessage =
    "Make it vegetarian and under 500 calories.";

  conversationHistory.push(user(secondMessage));

  const secondResult = await run(
    agent,
    conversationHistory
  );

  console.log(`👤 User: ${secondMessage}\n`);
  console.log(`🤖 Assistant:\n${secondResult.finalOutput}\n`);

  // Persist memory again
  conversationHistory = secondResult.history;

  console.log(
    `📦 Total conversation items: ${conversationHistory.length}`
  );
}

main().catch(console.error);
```

---

# What This Demonstrates

This lesson introduces the full stateful conversation lifecycle:

1. Start empty memory
2. Add user message
3. Run agent
4. Store `result.history`
5. Append another user message
6. Continue conversation

The important concept:

```ts
conversationHistory = result.history;
```

This line preserves memory.

Without it:

* the agent loses context
* the conversation resets every turn

---

# 02 — Inspecting Conversation History

## File

```txt
lessons/lesson-03-multi-turn-conversations/02-history-inspection.ts
```

## Source Code

```ts
import "dotenv/config";

import {
  run,
  user,
  AgentInputItem
} from "@openai/agents";

import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";

async function main() {
  console.log("🔍 Inspecting Conversation History\n");

  const agent = createRecipeAgent();

  let history: AgentInputItem[] = [];

  history.push(
    user("Give me a healthy smoothie recipe.")
  );

  const result = await run(agent, history);

  history = result.history;

  console.log(
    JSON.stringify(history, null, 2)
  );
}

main().catch(console.error);
```

---

# What You’ll Notice

The SDK stores:

* user messages
* assistant responses
* metadata
* provider data
* response IDs
* structured content blocks

This becomes the internal memory state of your conversation.

---

# 03 — Dynamic Stateful Chat Loop

## File

```txt
lessons/lesson-03-multi-turn-conversations/03-dynamic-memory-loop.ts
```

## Source Code

```ts
import "dotenv/config";

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  run,
  user,
  AgentInputItem
} from "@openai/agents";

import { createRecipeAgent } from "../../shared/agents/recipe-agent.js";

async function main() {
  console.log("💬 Interactive Stateful Chat\n");
  console.log("Type 'exit' to quit.\n");

  const agent = createRecipeAgent();

  const rl = readline.createInterface({
    input,
    output
  });

  let history: AgentInputItem[] = [];

  while (true) {
    const message = await rl.question("You: ");

    if (message.toLowerCase() === "exit") {
      break;
    }

    history.push(user(message));

    const result = await run(agent, history);

    console.log(`\nAssistant: ${result.finalOutput}\n`);

    // Persist memory
    history = result.history;
  }

  rl.close();
}

main().catch(console.error);
```

---

# Why This Is Important

This is your first truly conversational agent.

The agent now behaves like:

* ChatGPT
* Claude
* Gemini
* Copilot

because memory survives between turns.

---

# 04 — OpenRouter Stateful Fallback Chain

This lesson demonstrates resilient multi-turn execution using your centralized fallback architecture.

## File

```txt
lessons/lesson-03-multi-turn-conversations/04-openrouter-stateful-chat.ts
```

## Source Code

```ts
import "dotenv/config";

import {
  run,
  user,
  AgentInputItem
} from "@openai/agents";

import { MODEL_FALLBACK_CHAIN }
  from "../../shared/config/free-models.js";

import { createRecipeAgent }
  from "../../shared/agents/recipe-agent.js";

async function main() {
  console.log("🌐 OpenRouter Stateful Conversation\n");

  let history: AgentInputItem[] = [];

  const firstPrompt =
    "Create a healthy lunch idea.";

  history.push(user(firstPrompt));

  for (let i = 0; i < MODEL_FALLBACK_CHAIN.length; i++) {
    try {
      const agent = createRecipeAgent(i);

      const result = await run(agent, history);

      console.log(`\n👤 User: ${firstPrompt}\n`);
      console.log(`🤖 Assistant:\n${result.finalOutput}\n`);

      history = result.history;

      // Continue conversation
      const secondPrompt =
        "Now make it keto-friendly.";

      history.push(user(secondPrompt));

      const secondResult = await run(
        agent,
        history
      );

      console.log(`👤 User: ${secondPrompt}\n`);
      console.log(`🤖 Assistant:\n${secondResult.finalOutput}\n`);

      console.log(
        `✅ Conversation completed using: ${MODEL_FALLBACK_CHAIN[i]}`
      );

      return;

    } catch (error: any) {
      console.warn(
        `⚠️ Model failed: ${MODEL_FALLBACK_CHAIN[i]}`
      );

      console.warn(
        `Reason: ${error?.message || "Unknown"}\n`
      );
    }
  }

  console.error(
    "❌ All fallback models failed."
  );
}

main().catch(console.error);
```

---

# Why Fallback Chains Matter

Free-tier OpenRouter models frequently:

* rate limit
* throttle
* timeout
* overload

Your fallback-chain architecture gives:

* resiliency
* automatic recovery
* production reliability
* provider abstraction

This is exactly how real orchestration systems behave.

---

# Practice Exercise

## File

```txt
lessons/lesson-03-multi-turn-conversations/practice/starter.ts
```

## Starter Code

```ts
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
```

---

# Practice Solution

## File

```txt
lessons/lesson-03-multi-turn-conversations/practice/solution.ts
```

## Solution Code

```ts
import "dotenv/config";

import {
  run,
  user,
  AgentInputItem
} from "@openai/agents";

import { createRecipeAgent }
  from "../../../shared/agents/recipe-agent.js";

async function main() {
  const agent = createRecipeAgent();

  let history: AgentInputItem[] = [];

  const firstMessage =
    "Suggest a healthy dinner recipe.";

  history.push(user(firstMessage));

  const firstResult = await run(
    agent,
    history
  );

  console.log(`\n👤 ${firstMessage}\n`);
  console.log(`🤖 ${firstResult.finalOutput}\n`);

  history = firstResult.history;

  const secondMessage =
    "Now make it gluten-free.";

  history.push(user(secondMessage));

  const secondResult = await run(
    agent,
    history
  );

  console.log(`\n👤 ${secondMessage}\n`);
  console.log(`🤖 ${secondResult.finalOutput}\n`);
}

main().catch(console.error);
```

---

# Updated package.json Scripts

Add these scripts:

```json
{
  "scripts": {
    "lesson3:basic": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-03-multi-turn-conversations/01-basic-multi-turn.ts",

    "lesson3:inspect-history": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-03-multi-turn-conversations/02-history-inspection.ts",

    "lesson3:chat": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-03-multi-turn-conversations/03-dynamic-memory-loop.ts",

    "lesson3:openrouter": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-03-multi-turn-conversations/04-openrouter-stateful-chat.ts",

    "lesson3:solution": "cross-env OPENAI_TELEMETRY_DISABLED=true OPENAI_AGENTS_DISABLE_TRACING=1 tsx lessons/lesson-03-multi-turn-conversations/practice/solution.ts"
  }
}
```

---

# Running the Lessons

## Basic Multi-Turn

```bash
npm run lesson3:basic
```

## Inspect History

```bash
npm run lesson3:inspect-history
```

## Interactive Chat

```bash
npm run lesson3:chat
```

## OpenRouter Stateful Fallback

```bash
npm run lesson3:openrouter
```

## Practice Solution

```bash
npm run lesson3:solution
```

---

# Expected Learning Outcomes

After Lesson 3, students should understand:

* Stateful memory orchestration
* Multi-turn agent execution
* Conversation persistence
* Dynamic history mutation
* Structured conversation payloads
* OpenRouter conversational flows
* Fallback-chain resilience
* Production conversation architecture

---

# Preparation for Lesson 4

Lesson 4 introduces:

* Tool calling
* External function execution
* MCP foundations
* Tool orchestration
* Agent-to-system communication
* Dynamic capability discovery

This is where your agents evolve from conversational systems into real-world autonomous platforms.

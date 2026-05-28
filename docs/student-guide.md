# OpenRouter MCP Course — Student Guidebook

## Table of Contents

1. Introduction
2. What You Are Building
3. Understanding the Stack
4. OpenAI Agents SDK Fundamentals
5. OpenRouter Fundamentals
6. Project Architecture
7. Shared Agent Factory Pattern
8. Resilient Execution & Model Fallbacks
9. Lesson 1 — Simple Agents
10. Lesson 2 — Agent Results & Chaining
11. Lesson 3 — Multi-Turn Conversations
12. Lesson 4 — Tools & Function Calling
13. Understanding MCP Architecture
14. State Management
15. Streaming
16. Tool Design with Zod
17. Production Engineering Patterns
18. Debugging Strategies
19. Common Errors
20. Advanced Design Patterns
21. Recommended Exercises
22. Final Thoughts

---

# 1. Introduction

This course teaches you how to build production-grade AI agent systems using:

* TypeScript
* OpenAI Agents SDK
* OpenRouter
* Multi-model orchestration
* Stateful conversations
* Tool calling
* MCP architecture patterns

By the end of this course, you will understand:

* How AI agents work internally
* How conversation state is maintained
* How tools are executed
* How resilient execution systems work
* How multi-agent orchestration functions
* How modern MCP systems are designed

This is not just a collection of demos.

You are building a reusable architecture.

---

# 2. What You Are Building

Most tutorials teach:

```txt
prompt → model → response
```

This course teaches:

```txt
User
  ↓
Agent Layer
  ↓
Resilient Runner
  ↓
Fallback Models
  ↓
OpenRouter
  ↓
LLM Providers
  ↓
Tools
  ↓
State Memory
  ↓
Multi-Agent Pipelines
```

This is much closer to real-world AI infrastructure.

---

# 3. Understanding the Stack

## TypeScript

TypeScript gives:

* Type safety
* Better tooling
* Predictable architecture
* Safer refactoring

Example:

```ts
function greet(name: string) {
  return `Hello ${name}`;
}
```

Without TypeScript:

```js
greet(123); // Possible runtime bugs
```

With TypeScript:

```txt
❌ Type error before execution
```

---

## OpenAI Agents SDK

The SDK provides:

* Agent abstraction
* Tool execution
* Conversation orchestration
* Streaming
* Multi-turn conversations
* Structured execution

Core concepts:

```ts
Agent
run()
Runner
tool()
history
```

---

## OpenRouter

OpenRouter acts like a universal router for LLMs.

Instead of calling:

* OpenAI directly
* Anthropic directly
* Google directly

You call:

```txt
OpenRouter
```

And switch models dynamically.

Example:

```ts
model: "google/gemma-4-31b-it:free"
```

or:

```ts
model: "meta-llama/llama-3.3-70b-instruct:free"
```

---

## Zod

Zod validates tool inputs.

Without validation:

```ts
year1 = "banana"
```

With Zod:

```ts
z.object({
  year1: z.number()
})
```

Validation prevents invalid tool execution.

---

# 4. OpenAI Agents SDK Fundamentals

## Creating an Agent

Basic structure:

```ts
const agent = new Agent({
  name: "Recipe Chef",
  instructions: "Provide healthy recipes.",
  model: "google/gemma-4-31b-it:free"
});
```

The agent contains:

| Property      | Purpose                |
| ------------- | ---------------------- |
| name          | Agent identity         |
| instructions  | System behavior        |
| model         | LLM selection          |
| tools         | Tool access            |
| clientOptions | Provider configuration |

---

## Running an Agent

```ts
const result = await run(
  agent,
  "Give me a smoothie recipe."
);
```

Execution flow:

```txt
Prompt
  ↓
SDK Packaging
  ↓
Provider API
  ↓
Model Inference
  ↓
Result Object
```

---

# 5. OpenRouter Fundamentals

## Why OpenRouter?

Free-tier models fail frequently.

Typical issues:

* 429 Rate Limits
* 500 Provider Errors
* 404 Model Downtime
* Capacity Failures

OpenRouter allows:

* Multi-provider routing
* Dynamic model switching
* Unified API interface

---

## Your Environment

```env
OPENAI_API_KEY=sk-or-v1-xxxx
OPENROUTER_API_KEY=sk-or-v1-xxxx
OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

The OpenAI Agents SDK believes it is communicating with OpenAI.

But OpenRouter intercepts the request.

This compatibility layer is critical.

---

# 6. Project Architecture

Repository structure:

```txt
shared/
  agents/
  config/
  utils/

lessons/
  lesson-01-simple-agents/
  lesson-02-agent-results/
  lesson-03-multi-turn-conversations/
  lesson-04-tools/

utils/
docs/
```

---

# 7. Shared Agent Factory Pattern

## Problem

Without factories:

```ts
const agent1 = new Agent({...});
const agent2 = new Agent({...});
const agent3 = new Agent({...});
```

You duplicate:

* headers
* baseURL
* API keys
* timeout logic
* retry logic

This becomes unmaintainable.

---

## Solution

Centralize agent creation.

```ts
export function createRecipeAgent(model: string) {
  return new Agent({
    name: 'Recipe Chef',
    instructions: [
      {
        role: "system",
        content: "You are a creative chef."
      }
    ],
    model,
    clientOptions: {
      baseURL: OPENROUTER_BASE_URL,
      apiKey: OPENAI_API_KEY,
      defaultHeaders: OPENROUTER_HEADERS
    }
  });
}
```

Benefits:

* DRY architecture
* Centralized configuration
* Easier maintenance
* Cleaner lessons

---

# 8. Resilient Execution & Model Fallbacks

## Why Fallbacks Matter

Free models are unstable.

Your code must assume failure.

---

## The Fallback Chain

```ts
export const MODEL_FALLBACK_CHAIN = [
  'openai/gpt-oss-120b:free',
  'deepseek/deepseek-v4-flash:free',
  'meta-llama/llama-3.3-70b-instruct:free'
];
```

---

## Retry Flow

```txt
Attempt Model A
    ↓ fail
Attempt Model B
    ↓ fail
Attempt Model C
    ↓ success
Return Result
```

---

## Resilient Runner

```ts
for (const model of MODEL_FALLBACK_CHAIN) {
  try {
    const agent = createRecipeAgent(model);
    return await run(agent, prompt);
  } catch (error) {
    continue;
  }
}
```

This pattern appears repeatedly throughout the course.

Because production systems require resilience.

---

# 9. Lesson 1 — Simple Agents

Lesson 1 introduces:

* Agent creation
* Basic execution
* Streaming
* Runner instances
* OpenRouter integration

---

## 01-basic-agents.ts

You inspect the internal structure of an Agent.

```ts
console.log(agent);
```

This teaches:

* Agents are structured objects
* SDK abstractions wrap configuration
* Instructions are serialized internally

---

## 02-run-helper.ts

Introduces:

* `run()`
* fallback execution
* recursive retry patterns

Core idea:

```txt
Agents fail.
Your architecture should not.
```

---

## 03-runner-static.ts

Shows iterative fallback loops.

```ts
for (let i = 0; i < MODEL_FALLBACK_CHAIN.length; i++)
```

This is easier for beginners to visualize.

---

## 04-runner-instance.ts

Introduces:

```ts
const runner = new Runner();
```

The Runner manages orchestration lifecycle.

Useful for:

* shared execution state
* advanced workflows
* future MCP systems

---

## 05-streaming.ts

Introduces real-time token streaming.

```ts
streamedResult.toTextStream()
```

Instead of waiting for the entire response:

```txt
token → token → token → token
```

Streaming improves:

* UX
* responsiveness
* perceived latency

---

## 06-openrouter-agent.ts

Teaches direct OpenRouter integration.

Key idea:

```ts
clientOptions: {
  baseURL: OPENROUTER_BASE_URL
}
```

The SDK now communicates with OpenRouter instead of OpenAI directly.

---

# 10. Lesson 2 — Agent Results & Chaining

Lesson 2 focuses on the result object.

---

## Understanding the Result Object

```ts
const result = await run(...)
```

The result contains:

| Property    | Purpose             |
| ----------- | ------------------- |
| finalOutput | Final text          |
| history     | Full conversation   |
| newItems    | New generated items |
| input       | Original input      |
| lastAgent   | Last active agent   |

---

## history

Conversation memory.

```ts
console.log(result.history)
```

Useful for:

* multi-turn chat
* agent chaining
* memory systems

---

## newItems

Shows newly generated conversation nodes.

Useful for:

* debugging
* tracing
* orchestration visualization

---

## lastAgent

Important for multi-agent systems.

Example:

```txt
Research Agent
  ↓
Writer Agent
  ↓
Reviewer Agent
```

You can inspect which agent completed execution.

---

## Agent Chaining

One agent's history becomes another agent's input.

```ts
[...recipeResult.history, user("Write a blog post.")]
```

This is foundational MCP architecture.

---

# 11. Lesson 3 — Multi-Turn Conversations

Lesson 3 introduces persistent conversation memory.

---

## Stateless vs Stateful

### Stateless

```txt
Prompt → Response
```

No memory.

---

### Stateful

```txt
Message 1
Message 2
Message 3
```

History persists.

---

## AgentInputItem[]

```ts
let history: AgentInputItem[] = [];
```

This becomes the conversation memory container.

---

## Adding User Messages

```ts
history.push(user(message));
```

The conversation evolves over time.

---

## Saving Returned History

```ts
history = result.history;
```

Critical concept:

The model returns the updated state.

You persist it.

---

# 12. Lesson 4 — Tools & Function Calling

This is where agents become powerful.

---

# What Is a Tool?

A tool allows the model to execute code.

Without tools:

```txt
Model can only generate text
```

With tools:

```txt
Model can:
- search
- calculate
- fetch data
- query APIs
- execute logic
```

---

## Creating a Tool

```ts
const calculateYearsBetween = tool({
  name: 'calculate_years_between',
  parameters: z.object({
    year1: z.number(),
    year2: z.number()
  }),
  async execute({ year1, year2 }) {
    return Math.abs(year2 - year1);
  }
});
```

---

## Tool Lifecycle

```txt
User Prompt
  ↓
Model decides tool needed
  ↓
SDK validates input
  ↓
Tool executes
  ↓
Result returned to model
  ↓
Model responds naturally
```

---

## Why Zod Matters

Zod protects tool execution.

Example:

```ts
z.number()
```

Prevents:

```txt
"banana"
```

from reaching your tool logic.

---

## Multiple Tools

```ts
tools: [
  webSearchTool(),
  calculateYearsBetween
]
```

Agents can orchestrate multiple capabilities.

---

# 13. Understanding MCP Architecture

MCP stands for:

```txt
Model Context Protocol
```

Core idea:

Models need structured access to:

* tools
* memory
* context
* execution state
* orchestration pipelines

---

## MCP Components

### Context Layer

Stores:

* conversation
* files
* memory
* metadata

---

### Tool Layer

Executes:

* searches
* APIs
* functions
* databases

---

### Agent Layer

Coordinates:

* reasoning
* planning
* orchestration

---

### Transport Layer

Moves data between:

* clients
* servers
* models

---

# 14. State Management

State is everything the system remembers.

Examples:

* history
* memory
* tool outputs
* workflow state

---

## Why State Matters

Without state:

```txt
Every message is isolated
```

With state:

```txt
Agents become conversational
```

---

# 15. Streaming

Streaming improves UX dramatically.

Instead of:

```txt
(wait 10 seconds)
```

You get:

```txt
token-by-token rendering
```

---

## Streaming Pipeline

```txt
LLM
 ↓
Partial Tokens
 ↓
Node Stream
 ↓
stdout
```

---

# 16. Tool Design with Zod

Good tool design is critical.

---

## Bad Tool

```ts
parameters: z.any()
```

Dangerous.

---

## Good Tool

```ts
parameters: z.object({
  symbol: z.string()
})
```

Safe and predictable.

---

# 17. Production Engineering Patterns

This course introduces real engineering practices.

---

## DRY Principle

Don't Repeat Yourself.

Centralize:

* config
* headers
* retry logic
* factories

---

## Resilience

Always assume:

* providers fail
* APIs fail
* models disappear

Build recovery systems.

---

## Observability

Use logging:

```ts
console.log()
```

to inspect:

* history
* retries
* model switching
* execution state

---

# 18. Debugging Strategies

## Inspect Result Objects

```ts
console.log(JSON.stringify(result, null, 2))
```

---

## Inspect History

```ts
console.log(result.history)
```

---

## Inspect newItems

```ts
console.log(result.newItems)
```

---

# 19. Common Errors

## 429 Rate Limit

Meaning:

```txt
Too many requests
```

Solution:

* fallback models
* delay/backoff
* retries

---

## 404 Model Not Found

Model removed or unavailable.

Solution:

* rotate models
* update FREE_MODELS

---

## 500 Provider Error

Temporary provider failure.

Solution:

* retry
* fallback

---

# 20. Advanced Design Patterns

## Multi-Agent Pipelines

Example:

```txt
Research Agent
  ↓
Planner Agent
  ↓
Writer Agent
  ↓
Reviewer Agent
```

---

## Dynamic Routing

Future systems can choose models dynamically:

```txt
Cheap Model → Simple Tasks
Large Model → Complex Tasks
```

---

## Tool-Augmented Agents

Agents become orchestrators instead of chatbots.

---

# 21. Recommended Exercises

## Beginner

* Add new recipe prompts
* Add new tools
* Modify instructions

---

## Intermediate

* Add weather API tools
* Add finance tools
* Add persistent file storage

---

## Advanced

* Build autonomous agent loops
* Add vector databases
* Build MCP servers
* Create tool registries
* Add workflow graphs

---

# 22. Final Thoughts

This course is designed to teach modern AI engineering architecture.

You are learning:

* orchestration
* resiliency
* tooling
* state management
* multi-agent systems
* MCP foundations

These patterns scale far beyond recipe agents.

The exact same architecture can power:

* enterprise copilots
* coding assistants
* research agents
* autonomous workflows
* AI operating systems

You are not just learning prompts.

You are learning infrastructure.

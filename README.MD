# OpenRouter MCP Course

A production-grade TypeScript course designed to take developers from simple agent execution to resilient multi-agent systems and ultimately **Model Context Protocol (MCP)** architecture.

This repository teaches not just SDK syntax, but real-world engineering patterns for scalable AI systems.

---

# 🎯 Course Goals

By the end of this course, you will understand how to:

* Build agents using the OpenAI Agents SDK
* Integrate OpenRouter as an OpenAI-compatible backend
* Create resilient multi-model fallback systems
* Implement reusable agent factories
* Stream responses in real time
* Maintain multi-turn conversational memory
* Inspect and debug result objects
* Chain multiple agents together
* Build tool-enabled agents
* Design production-style orchestration layers
* Prepare for MCP server/client architectures

---

# 🛠 Tech Stack

| Technology        | Purpose                          |
| ----------------- | -------------------------------- |
| TypeScript        | Type-safe orchestration          |
| OpenAI Agents SDK | Agent lifecycle & orchestration  |
| OpenRouter        | Multi-model routing              |
| tsx               | Zero-config TypeScript execution |
| zod               | Tool & MCP schema validation     |
| dotenv            | Environment configuration        |
| cross-env         | Cross-platform runtime variables |

---

# 🧠 Architectural Philosophy

This repository intentionally follows **production-oriented architecture** instead of isolated demos.

Most tutorials demonstrate:

```ts
const result = await run(agent, "Hello");
```

This course instead focuses on:

* reusable abstractions
* resilient execution
* provider failover
* centralized configuration
* agent orchestration
* conversational state
* distributed execution concepts
* scalable architecture patterns

The goal is to prepare you for real-world AI engineering systems.

---

# 🔑 Obtaining Your API Keys

To bridge the OpenAI Agents SDK with OpenRouter, you need a valid OpenRouter API key.

Because the OpenAI Agents SDK is OpenAI-compatible, the same key can be used for both:

* `OPENAI_API_KEY`
* `OPENROUTER_API_KEY`

---

## 1. Generate Your OpenRouter Key

1. Navigate to:
   https://openrouter.ai

2. Create an account or sign in

3. Open:
   https://openrouter.ai/keys

4. Click:
   Create Key

5. Copy the generated key immediately

---

# ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
# OpenRouter Credentials
OPENAI_API_KEY=sk-or-v1-YOUR_KEY
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY

# OpenAI-Compatible Endpoint
OPENAI_BASE_URL=https://openrouter.ai/api/v1

# Default Model
OPENROUTER_MODEL=openai/gpt-oss-120b:free

# SDK Diagnostics
OPENAI_AGENTS_DISABLE_TRACING=1
OPENAI_TELEMETRY_DISABLED=true
```

---

# 🚀 Quick Start

---

## 1. Create the Project

```bash
mkdir openrouter-mcp-course
cd openrouter-mcp-course
npm init -y
```

---

## 2. Install Dependencies

```bash
npm install @openai/agents dotenv zod
npm install -D typescript tsx @types/node cross-env
```

---

## 3. Run Your First Lesson

```bash
npm run lesson1:openrouter
```

---

# 📁 Repository Structure

```txt
.
├── lessons/
│
│   ├── lesson-01-simple-agents/
│   ├── lesson-02-agent-results/
│   ├── lesson-03-multi-turn-conversations/
│   └── lesson-04-tools/
│
├── shared/
│   ├── agents/
│   ├── config/
│   └── utils/
│
├── utils/
├── docs/
├── package.json
└── tsconfig.json
```

---

# 🏗 Shared Architecture

The repository uses centralized architecture to avoid duplicated boilerplate and improve maintainability.

---

# Shared Agent Factory

```ts
export function createRecipeAgent(model: string) {
  return new Agent({
    name: 'Recipe Chef',

    instructions: [
      {
        role: "system",
        content: "You are a creative chef. Provide healthy recipes."
      }
    ],

    model,

    clientOptions: {
      baseURL: OPENROUTER_BASE_URL,
      apiKey: OPENAI_API_KEY,
      defaultHeaders: OPENROUTER_HEADERS,
      timeout: 30000
    }
  });
}
```

This pattern centralizes:

* provider configuration
* retry compatibility
* headers
* timeouts
* model routing
* instruction structure

Without factories, every lesson would duplicate configuration logic.

Factories become increasingly important in:

* multi-agent systems
* workflow graphs
* MCP environments
* distributed orchestration

---

# 🔁 Resilient Runner

Free-tier models are unreliable.

Providers frequently:

* return 429 errors
* timeout
* disappear temporarily
* overload
* rotate models
* exhaust credits

To solve this, the repository introduces a resilient execution layer.

---

## Basic Retry Architecture

```ts
const result = await runWithRetry(
  "Chef Agent",
  "Provide healthy recipes.",
  "Make me a salad"
);
```

---

## What `runWithRetry()` Handles

The resilient runner automatically:

* rotates fallback models
* retries transient failures
* preserves execution structure
* standardizes orchestration
* reduces lesson complexity

This mirrors production orchestration systems.

---

# 🔄 Model Fallback Chain

```ts
export const MODEL_FALLBACK_CHAIN = [
  'openai/gpt-oss-120b:free',
  'deepseek/deepseek-v4-flash:free',
  'google/gemma-4-31b-it:free',
  ...
];
```

This enables:

* automatic failover
* provider redundancy
* resilience against outages
* continuous execution

This is one of the most important architectural concepts in the repository.

---

# 📚 Lesson Overview

The lessons intentionally evolve in complexity.

Each lesson builds on previous architectural concepts.

---

# Lesson 1 — Simple Agents

Folder:

```txt
lessons/lesson-01-simple-agents
```

---

# Lesson Goal

Understand the foundational execution model of the OpenAI Agents SDK.

You will learn:

* how agents are created
* how the SDK structures agents internally
* how execution works
* how to stream outputs
* how to integrate OpenRouter
* how fallback systems operate

---

# File Breakdown

---

## 01 — Basic Agent Inspection

File:

```txt
01-basic-agents.ts
```

### Concepts Introduced

* Agent constructor
* internal agent structure
* instruction handling
* reusable agent factories

### Key Learning Outcome

Understand that agents are structured objects with:

* instructions
* models
* tools
* execution settings
* client configuration

### Run

```bash
npm run lesson1:basic
```

---

## 02 — Helper-Based Runner

File:

```txt
02-run-helper.ts
```

### Concepts Introduced

* recursive retries
* resilient execution
* fallback rotation
* SDK noise suppression

### Architecture Focus

Introduces recursive fallback execution:

```ts
await main(modelIndex + 1);
```

This simulates fault-tolerant orchestration pipelines.

### Run

```bash
npm run lesson1:run
```

---

## 03 — Static Runner Loop

File:

```txt
03-runner-static.ts
```

### Concepts Introduced

* iterative retry loops
* explicit control flow
* error classification
* success tracking

### Key Difference

Unlike recursion, this demonstrates controlled loop-based failover.

Useful for:

* batch systems
* worker queues
* orchestrators

### Run

```bash
npm run lesson1:runner-static
```

---

## 04 — Runner Instance API

File:

```txt
04-runner-instance.ts
```

### Concepts Introduced

* `Runner` class
* reusable execution engines
* orchestration abstraction

### Why This Matters

The `Runner` abstraction becomes important for:

* workflow engines
* reusable orchestration services
* stateful execution environments

### Run

```bash
npm run lesson1:runner-instance
```

---

## 05 — Streaming Responses

File:

```txt
05-streaming.ts
```

### Concepts Introduced

* token streaming
* incremental rendering
* live response pipelines

### Key SDK Feature

```ts
streamedResult.toTextStream()
```

This is foundational for:

* chat applications
* real-time UIs
* streaming APIs
* MCP streaming transports

### Run

```bash
npm run lesson1:stream
```

---

## 06 — Direct OpenRouter Agent

File:

```txt
06-openrouter-agent.ts
```

### Concepts Introduced

* explicit OpenRouter configuration
* OpenAI-compatible providers
* clientOptions structure

### Important Insight

The OpenAI Agents SDK can communicate with OpenRouter because OpenRouter implements OpenAI-compatible APIs.

### Run

```bash
npm run lesson1:openrouter
```

---

# Practice Exercise

Files:

```txt
practice/starter.ts
practice/solution.ts
```

Students implement:

* basic agent execution
* model configuration
* result handling

### Run Solution

```bash
npm run lesson1:solution
```

---

# Lesson 2 — Agent Results

Folder:

```txt
lessons/lesson-02-agent-results
```

---

# Lesson Goal

Understand what actually comes back from the SDK after execution.

This lesson teaches how to inspect and leverage:

* execution traces
* history
* internal items
* chained outputs
* agent state

---

# Why This Matters

Most developers only use:

```ts
result.finalOutput
```

Production systems often require:

* execution history
* auditability
* observability
* state persistence
* workflow chaining

---

# Result Object Anatomy

| Property      | Purpose                       |
| ------------- | ----------------------------- |
| `input`       | Original prompt               |
| `finalOutput` | Final generated response      |
| `history`     | Full conversational state     |
| `newItems`    | Newly created execution items |
| `lastAgent`   | Final executing agent         |

---

# File Breakdown

---

## 01 — Basic Result Object

Learn how to inspect the entire result structure.

### Concepts

* result inspection
* execution metadata
* debugging

### Run

```bash
npm run lesson2:basic
```

---

## 02 — Inspect New Items

Learn how the SDK stores newly generated execution events.

### Concepts

* internal execution items
* event inspection
* trace structures

### Run

```bash
npm run lesson2:new-items
```

---

## 03 — Inspect History

Learn how conversation history is represented internally.

### Concepts

* state persistence
* message structures
* conversation serialization

### Run

```bash
npm run lesson2:history
```

---

## 04 — Last Agent

Learn how to identify the final executing node in a chain.

### Concepts

* chain tracking
* orchestration metadata
* execution ownership

### Run

```bash
npm run lesson2:last-agent
```

---

## 05 — Chaining Agents

Build a two-agent workflow:

1. recipe generator
2. blog writer

### Concepts

* agent handoff
* history transfer
* pipeline orchestration

### Run

```bash
npm run lesson2:chain
```

---

## 06 — OpenRouter Multi-Model Chain

Introduces recursive resilient execution across multiple chained agents.

### Concepts

* recursive orchestration
* provider failover
* chain resilience

### Run

```bash
npm run lesson2:openrouter-chain
```

---

# Lesson 3 — Multi-Turn Conversations

Folder:

```txt
lessons/lesson-03-multi-turn-conversations
```

---

# Lesson Goal

Build persistent conversational systems.

This lesson introduces memory and state management.

---

# Why This Matters

Stateful systems are essential for:

* AI assistants
* copilots
* customer support
* workflow agents
* MCP sessions

---

# File Breakdown

---

## 01 — Basic Multi-Turn

Learn simple conversation continuation.

### Concepts

* conversation memory
* sequential execution
* state reuse

### Run

```bash
npm run lesson3:basic
```

---

## 02 — History Inspection

Inspect how the SDK stores memory internally.

### Concepts

* serialized history
* conversational state graphs
* debugging stateful systems

### Run

```bash
npm run lesson3:inspect-history
```

---

## 03 — Dynamic Memory Loop

Build an interactive CLI chatbot.

### Concepts

* infinite loops
* live state updates
* dynamic history mutation
* persistent sessions

### Exit Command

```txt
exit
```

### Run

```bash
npm run lesson3:chat
```

---

## 04 — OpenRouter Stateful Chat

Combine:

* state
* fallback models
* OpenRouter routing
* persistent memory

### Run

```bash
npm run lesson3:openrouter
```

---

# Practice Exercise

Students implement:

* stateful history
* multi-turn continuation
* history persistence

### Run

```bash
npm run lesson3:solution
```

---

# Lesson 4 — Tools

Folder:

```txt
lessons/lesson-04-tools
```

---

# Lesson Goal

Introduce tool-enabled agents.

Agents become capable of:

* calculations
* external retrieval
* structured actions
* workflow augmentation

---

# Why Tools Matter

Tools are foundational to:

* MCP
* agent ecosystems
* retrieval systems
* external integrations
* orchestration frameworks

---

# File Breakdown

---

## 01 — Web Search Tool

Introduces a mock search tool.

### Concepts

* tool registration
* zod validation
* structured execution

### Run

```bash
npm run lesson4:web-search
```

---

## 02 — Custom Function Tool

Introduces mathematical computation tools.

### Concepts

* custom logic
* deterministic execution
* function orchestration

### Run

```bash
npm run lesson4:custom-tool
```

---

## 03 — Integrated Tools

Combines:

* web search
* calculations
* multi-tool reasoning

### Concepts

* tool composition
* orchestration chains
* structured reasoning

### Run

```bash
npm run lesson4:integrated
```

---

# Practice Exercise

Students implement a stock lookup tool.

### Concepts

* mock external APIs
* schema validation
* structured tool execution

### Run

```bash
npm run lesson4:solution
```

---

# 🧪 Utility Scripts

---

## Check Available Models

```bash
node utils/check-available-models.js
```

---

## Show Only Free Models

```bash
node utils/check-available-models.js --free
```

---

## Search Models

```bash
node utils/check-available-models.js --search gemma
```

---

## Output JSON

```bash
node utils/check-available-models.js --json
```

---

# 🔍 Example Runtime Output

---

## Streaming Example

```txt
➔ Attempting streaming with: openai/gpt-oss-120b:free...

Here is a healthy Mediterranean lunch recipe...
```

---

## Multi-Agent Example

```txt
[RECIPE_STEP] Success using: deepseek/deepseek-v4-flash:free
[BLOG_STEP] Success using: google/gemma-4-31b-it:free
```

---

# 🛡 Security Warning

Never commit your `.env` file.

If your key is exposed:

1. Revoke it immediately
2. Generate a new key
3. Update your environment variables

---

# 🧭 Recommended Learning Path

1. Lesson 1 — Agent fundamentals
2. Lesson 2 — Result objects & orchestration
3. Lesson 3 — Stateful systems
4. Lesson 4 — Tool ecosystems
5. Future MCP lessons — Distributed AI systems

---

# 🚧 Upcoming MCP Lessons

Future lessons will include:

* MCP servers
* Stateful HTTP MCP
* Tool registries
* MCP transport layers
* Agent routing systems
* Retrieval workflows
* Multi-agent orchestration graphs
* Distributed context systems
* Persistent memory layers
* Agent runtime infrastructure

---

# 📄 License

MIT

---

# Final Note

This repository is intentionally structured like a miniature AI platform.

The goal is not only to teach SDK usage, but to teach how modern AI systems are engineered in production.

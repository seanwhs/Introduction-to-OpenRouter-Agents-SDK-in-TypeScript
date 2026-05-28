# Architecture Guide

Understanding the internal architecture of the OpenRouter MCP Course.

This document explains:

* how agents are created
* how execution flows through the system
* how OpenRouter integrates with the SDK
* how fallback models work
* how conversation memory is preserved
* how tools execute
* how multi-agent chains function
* how the repository evolves toward MCP architecture

This guide is intentionally beginner-friendly and verbose.

---

# Table of Contents

1. High-Level System Architecture
2. Repository Layers
3. OpenAI Agents SDK Architecture
4. OpenRouter Integration
5. Shared Agent Factory Pattern
6. Resilient Runner Architecture
7. Fallback Model Rotation
8. Result Object Lifecycle
9. Multi-Turn Conversation Architecture
10. Tool Execution Architecture
11. Multi-Agent Chaining
12. Streaming Architecture
13. Error Handling Strategy
14. Why This Architecture Matters
15. Evolution Toward MCP

---

# 1. High-Level System Architecture

At the highest level, the repository looks like this:

```mermaid id="lvw4yc"
flowchart TD

    User[User Prompt]

    Lesson[Lesson File]

    Runner[runWithRetry]

    Factory[Agent Factory]

    Agent[OpenAI Agent]

    OpenRouter[OpenRouter API]

    Models[Fallback Models]

    Result[Result Object]

    User --> Lesson
    Lesson --> Runner
    Runner --> Factory
    Factory --> Agent
    Agent --> OpenRouter
    OpenRouter --> Models
    Models --> Result
```

---

# Beginner Explanation

The repository is divided into multiple layers.

Instead of calling models directly everywhere, we centralize responsibilities.

This allows:

* cleaner code
* easier debugging
* provider failover
* reusable architecture
* production scalability

---

# 2. Repository Layers

The repository intentionally separates concerns.

```mermaid id="vkr0ev"
flowchart TB

    subgraph lessons
        L1[Lesson Files]
    end

    subgraph shared
        A[Agent Factory]
        R[Runner]
        C[Config]
    end

    subgraph providers
        O[OpenRouter]
        M[AI Models]
    end

    L1 --> R
    R --> A
    A --> C
    A --> O
    O --> M
```

---

# Why Layering Matters

Without layering, every file would duplicate:

* API configuration
* retry logic
* model settings
* headers
* timeouts
* orchestration

Layering avoids repetition.

This becomes critical in large AI systems.

---

# 3. OpenAI Agents SDK Architecture

The OpenAI Agents SDK revolves around a few key concepts:

* Agent
* Runner
* run()
* Result objects
* Tools
* History

---

# Agent Lifecycle

```mermaid id="fd1dhs"
sequenceDiagram
    participant User
    participant Agent
    participant SDK
    participant Model

    User->>Agent: Prompt
    Agent->>SDK: Execute
    SDK->>Model: Completion Request
    Model-->>SDK: Response
    SDK-->>Agent: Result Object
    Agent-->>User: finalOutput
```

---

# Key Idea

An Agent is not the model itself.

An Agent is:

* instructions
* tools
* model configuration
* execution metadata

The SDK orchestrates communication between:

* your code
* the model provider
* the execution runtime

---

# 4. OpenRouter Integration

The repository uses OpenRouter as an OpenAI-compatible backend.

---

# Why OpenRouter?

OpenRouter provides:

* access to many providers
* model abstraction
* free-tier models
* fallback flexibility

Instead of locking into one provider, we gain portability.

---

# OpenRouter Request Flow

```mermaid id="kaf8w0"
sequenceDiagram

    participant App
    participant Agent
    participant OpenRouter
    participant Provider

    App->>Agent: run()
    Agent->>OpenRouter: OpenAI-compatible request
    OpenRouter->>Provider: Route request
    Provider-->>OpenRouter: Completion
    OpenRouter-->>Agent: Response
    Agent-->>App: Result
```

---

# Beginner Insight

Even though we use the OpenAI Agents SDK:

```ts id="tgnclv"
import { Agent } from "@openai/agents";
```

the requests are actually routed to OpenRouter.

This works because OpenRouter implements OpenAI-compatible APIs.

---

# 5. Shared Agent Factory Pattern

One of the most important architectural patterns in the repository is the Shared Agent Factory.

---

# The Problem

Without factories:

```ts id="s6x4sp"
const agent = new Agent({
  ...
});
```

would appear in every file.

That causes:

* duplicated configuration
* inconsistent settings
* difficult maintenance

---

# The Solution

Centralize creation logic.

---

# Factory Architecture

```mermaid id="ybvcqr"
flowchart LR

    Lesson --> Factory
    Factory --> Agent
    Agent --> OpenRouter
```

---

# Shared Factory Example

```ts id="6q0q2x"
export function createRecipeAgent(model: string) {
  return new Agent({
    name: "Recipe Chef",

    instructions: [
      {
        role: "system",
        content: "You are a creative chef."
      }
    ],

    model,

    clientOptions: {
      baseURL: OPENROUTER_BASE_URL,
      apiKey: OPENAI_API_KEY
    }
  });
}
```

---

# Benefits

Factories provide:

* consistency
* scalability
* centralized upgrades
* reusable orchestration

This is a common enterprise architecture pattern.

---

# 6. Resilient Runner Architecture

The resilient runner is the heart of fault tolerance.

---

# Why We Need It

Free-tier models frequently fail.

Common issues:

| Error | Meaning          |
| ----- | ---------------- |
| 429   | Rate limited     |
| 500   | Provider failure |
| 404   | Model removed    |
| 402   | Credit exhausted |

Without retries, applications become unstable.

---

# Resilient Flow

```mermaid id="2k2r6z"
flowchart TD

    Start[Start Execution]

    TryModel[Try Current Model]

    Success{Success?}

    Return[Return Result]

    Next[Try Next Model]

    Fail[All Models Failed]

    Start --> TryModel
    TryModel --> Success

    Success -->|Yes| Return
    Success -->|No| Next

    Next --> TryModel

    Next --> Fail
```

---

# Beginner Explanation

The system tries models one-by-one until one succeeds.

This is called:

* failover
* fallback rotation
* resilient orchestration

Production AI systems use this heavily.

---

# Recursive Retry Pattern

```ts id="v4u86k"
await main(modelIndex + 1);
```

This creates a retry chain.

---

# Loop-Based Retry Pattern

```ts id="cgrqkr"
for (const model of MODEL_FALLBACK_CHAIN) {
  ...
}
```

This creates iterative failover.

Both approaches are demonstrated intentionally.

---

# 7. Fallback Model Rotation

The repository maintains a centralized fallback list.

```ts id="tw5y8r"
export const MODEL_FALLBACK_CHAIN = [
  'openai/gpt-oss-120b:free',
  'deepseek/deepseek-v4-flash:free',
  ...
];
```

---

# Why Centralization Matters

If models change:

* update one file
* entire repository updates automatically

This is called:

* configuration centralization
* dependency abstraction

---

# Model Rotation Flow

```mermaid id="9azk44"
sequenceDiagram

    participant Runner
    participant Model1
    participant Model2
    participant Model3

    Runner->>Model1: Request

    Model1-->>Runner: 429 Error

    Runner->>Model2: Retry

    Model2-->>Runner: 500 Error

    Runner->>Model3: Retry

    Model3-->>Runner: Success
```

---

# 8. Result Object Lifecycle

Most beginners only use:

```ts id="i1ic0k"
result.finalOutput
```

But the SDK returns much more.

---

# Result Object Structure

```mermaid id="8utmv0"
flowchart TD

    Result[result]

    Result --> Input[input]
    Result --> Output[finalOutput]
    Result --> History[history]
    Result --> Items[newItems]
    Result --> Agent[lastAgent]
```

---

# Why Result Objects Matter

Result objects enable:

* debugging
* memory persistence
* multi-agent workflows
* orchestration tracing
* auditability

---

# Example

```ts id="j0k0aq"
console.log(result.history);
console.log(result.newItems);
console.log(result.lastAgent);
```

---

# 9. Multi-Turn Conversation Architecture

Conversation memory is implemented through history persistence.

---

# Conversation Lifecycle

```mermaid id="z4vnkv"
sequenceDiagram

    participant User
    participant History
    participant Agent
    participant Model

    User->>History: Add Message
    History->>Agent: Full Context
    Agent->>Model: Completion Request
    Model-->>Agent: Response
    Agent-->>History: Updated History
```

---

# Key Concept

Models are stateless.

They do NOT remember previous conversations automatically.

Memory is simulated by resending conversation history.

---

# History Structure

```ts id="r8gx5l"
history.push(user("Hello"));
```

Each interaction expands the context window.

---

# Interactive Chat Loop

```mermaid id="dl6vtx"
flowchart TD

    Start[Start Chat]

    UserInput[User Message]

    History[Update History]

    Run[Run Agent]

    Output[Print Response]

    Exit{Exit?}

    Start --> UserInput
    UserInput --> History
    History --> Run
    Run --> Output
    Output --> Exit
    Exit -->|No| UserInput
```

---

# 10. Tool Execution Architecture

Tools allow agents to execute structured actions.

---

# Tool Flow

```mermaid id="z02u9v"
sequenceDiagram

    participant User
    participant Agent
    participant Tool
    participant Model

    User->>Agent: Prompt
    Agent->>Model: Decide Action
    Model->>Tool: Execute Tool
    Tool-->>Model: Tool Result
    Model-->>Agent: Final Response
```

---

# Beginner Explanation

The model decides:

* whether a tool is needed
* which tool to use
* what parameters to pass

The SDK orchestrates execution automatically.

---

# Tool Definition

```ts id="b7zw5g"
const myTool = tool({
  name: "echo_tool",

  parameters: z.object({
    message: z.string()
  }),

  async execute({ message }) {
    return `Echo: ${message}`;
  }
});
```

---

# Why Zod Matters

Zod provides:

* runtime validation
* schema enforcement
* safer execution
* predictable tooling

This becomes essential for MCP.

---

# 11. Multi-Agent Chaining

One agent can feed another.

---

# Example Chain

```mermaid id="v0y7e6"
flowchart LR

    RecipeAgent --> RecipeOutput

    RecipeOutput --> BlogAgent

    BlogAgent --> BlogPost
```

---

# Real Example

Step 1:

* generate recipe

Step 2:

* pass history into blog writer

---

# Sequence Diagram

```mermaid id="xvqkhm"
sequenceDiagram

    participant User
    participant RecipeAgent
    participant BlogAgent

    User->>RecipeAgent: Create recipe

    RecipeAgent-->>User: Recipe Result

    User->>BlogAgent: Transform recipe

    BlogAgent-->>User: Blog Post
```

---

# Why This Matters

This introduces:

* orchestration graphs
* distributed workflows
* specialized agents
* cooperative execution

These are foundational MCP concepts.

---

# 12. Streaming Architecture

Streaming allows incremental token delivery.

---

# Streaming Flow

```mermaid id="j0ttk6"
sequenceDiagram

    participant User
    participant Agent
    participant Model

    User->>Agent: Request

    Agent->>Model: Streaming Request

    loop Tokens
        Model-->>Agent: Partial Tokens
        Agent-->>User: Stream Output
    end
```

---

# Why Streaming Matters

Streaming improves:

* responsiveness
* user experience
* perceived performance
* interactive systems

Streaming is essential for:

* chat applications
* copilots
* IDE assistants
* MCP transports

---

# 13. Error Handling Strategy

The repository intentionally handles failures explicitly.

---

# Error Categories

| Status | Meaning           |
| ------ | ----------------- |
| 429    | Rate limit        |
| 500    | Provider failure  |
| 404    | Model unavailable |
| 402    | Credits exhausted |

---

# Error Recovery Flow

```mermaid id="wxyk0u"
flowchart TD

    Request --> Execute

    Execute --> Success{Success?}

    Success -->|Yes| Return

    Success -->|No| Retry

    Retry --> NextModel

    NextModel --> Execute
```

---

# Why Explicit Error Handling Matters

Production AI systems must survive unreliable providers.

Without resilience:

* conversations break
* chains fail
* workflows crash

---

# 14. Why This Architecture Matters

This repository intentionally mirrors real-world AI systems.

---

# Traditional Tutorial Architecture

```mermaid id="7e8k3y"
flowchart LR

    App --> Model
```

Simple but fragile.

---

# Production Architecture

```mermaid id="ecy0ic"
flowchart LR

    App --> Runner

    Runner --> Factory

    Factory --> OpenRouter

    OpenRouter --> Models
```

More complex but:

* scalable
* resilient
* maintainable
* extensible

---

# 15. Evolution Toward MCP

This repository gradually prepares you for MCP.

---

# What Is MCP?

Model Context Protocol (MCP) standardizes how:

* tools
* agents
* memory
* context
* external systems

communicate together.

---

# Current Architecture

```mermaid id="vvm30o"
flowchart LR

    User --> Agent
    Agent --> Tools
```

---

# Future MCP Architecture

```mermaid id="5hgwfr"
flowchart TD

    Client --> MCPServer

    MCPServer --> Tools
    MCPServer --> Memory
    MCPServer --> Retrieval
    MCPServer --> Agents
```

---

# Why This Course Evolves Gradually

Jumping directly into MCP would overwhelm beginners.

So the repository builds concepts progressively:

1. agents
2. runners
3. memory
4. tools
5. orchestration
6. distributed systems
7. MCP

---

# Final Thoughts

This repository is intentionally more architectural than most AI tutorials.

The purpose is to teach:

* how AI systems actually work
* how orchestration layers are built
* how resilient execution is designed
* how scalable agent systems evolve

Understanding these patterns is critical for building production AI systems.

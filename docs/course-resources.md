# docs/resources.md

This document serves as your central hub for configuring the course environment, resolving SDK initialization quirks, and managing provider authentication.

---

## 1. Quick Start: Environment Configuration

To initialize the project, create a `.env` file in the **project root**. This file bridges the requirements of the `@openai/agents` SDK with the OpenRouter/DeepSeek infrastructure.

### The `.env` Configuration

```env
# SDK Compatibility (Required to prevent initialization crash)
OPENAI_API_KEY=sk-or-placeholder-or-your-real-key
OPENAI_BASE_URL=https://openrouter.ai/api/v1

# Course-level abstraction (OpenRouter)
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=deepseek/deepseek-r1:free

# SDK Diagnostics
OPENAI_AGENTS_DISABLE_TRACING=1
OPENAI_TELEMETRY_DISABLED=true

```

> ⚠️ **Critical Requirement:** Every entry file (`.ts`) must have `import "dotenv/config";` as the **very first line**. Without this, the SDK will attempt to initialize before your environment variables are loaded, causing a runtime crash.

---

## 2. Resolving the SDK "Handshake" Quirk

The `@openai/agents` library includes a hardcoded check for `OPENAI_API_KEY` on startup. If this key is missing, the SDK throws an exception before your custom configuration can be applied.

### Why it's safe:

* **No Hidden Costs:** Satisfying this check costs nothing.
* **Routing Control:** Because you explicitly set the `baseURL` to OpenRouter or DeepSeek, your requests are routed to those endpoints. The `OPENAI_API_KEY` placeholder is merely an initialization "pass-key" to satisfy the SDK's internal guard.

---

## 3. Provider Strategies

Depending on your project stage, choose one of these two architectural approaches:

| Strategy | Best Use Case | Implementation Difficulty | Architectural Impact |
| --- | --- | --- | --- |
| **Option A: Map Keys** | Quick labs & tracking exercises | ⭐ Easy | **High coupling:** Your environment masquerades as OpenAI. |
| **Option B: Explicit Injection** | Production-grade systems | ⭐⭐ Moderate | **Low coupling:** Allows explicit dependency injection of custom clients. |

### Option B Example (`shared/agents/factory.ts`):

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: process.env.OPENROUTER_BASE_URL!,
});

// Inject this 'client' instance into your agent's run configuration

```

---

## 4. Alternative: Direct DeepSeek Configuration

If you prefer to bypass the OpenRouter aggregator and connect directly to DeepSeek’s native infrastructure:

1. **Get Key:** Generate an API Key at [platform.deepseek.com](https://platform.deepseek.com/).
2. **Update `.env`:**

```env
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_API_KEY=sk-your-actual-deepseek-key
OPENROUTER_BASE_URL=https://api.deepseek.com/v1
OPENROUTER_API_KEY=sk-your-actual-deepseek-key
OPENROUTER_MODEL=deepseek-chat

```

---

## 5. Troubleshooting & Architecture

### Lifecycle of the SDK Initialization

If you encounter an "Unauthorized" or "Missing Credentials" error, ensure your execution flow follows this order:

1. **Load Environment:** `import "dotenv/config";` (Top of file)
2. **Initialize SDK:** SDK reads `process.env.OPENAI_API_KEY` (Handshake).
3. **Execute Logic:** Agent uses `clientOptions` (Network request sent to OpenRouter/DeepSeek).

### Terminal Best Practices

Always execute commands from the `project-root/` directory:

```bash
# CORRECT
npm run lesson1:run

# INCORRECT (dotenv will fail to find your .env file)
cd lessons/lesson-01-simple-agents
node 01-basic-agents.ts

```

---

## 6. Security & Best Practices

* **Revocation:** If you accidentally commit a live `sk-or-v1-...` key to GitHub, **revoke it immediately** in your OpenRouter/DeepSeek settings dashboard.
* **Environment Safety:** Never commit your `.env` file. Keep the `node_modules/` and `.env` files in your `.gitignore`.
* **Resilience:** For free-tier users, use a **Model Fallback Chain** in your agent factory to handle rate limits gracefully:
```typescript
export const MODEL_FALLBACK_CHAIN = [
  'google/gemma-4-26b-a4b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'deepseek/deepseek-v4-flash:free'
];

```


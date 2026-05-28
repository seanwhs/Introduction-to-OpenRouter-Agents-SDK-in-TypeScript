# OpenRouter MCP Course

A production-grade TypeScript course designed to take developers from basic agent interactions to **Model Context Protocol (MCP)** architecture.

---

## 🛠 Tech Stack

| Technology | Purpose |
| --- | --- |
| **TypeScript** | Type-safe orchestration |
| **OpenAI Agents SDK** | Core agent lifecycle & orchestration |
| **OpenRouter/DeepSeek** | Multi-model routing & provider abstraction |
| **tsx** | Zero-config TypeScript execution |
| **zod** | Schema validation for tools/MCP |

---

## 🚀 Quick Start

### 1. Installation

```bash
mkdir openrouter-mcp-course && cd openrouter-mcp-course
npm init -y
npm install @openai/agents dotenv zod
npm install -D typescript tsx @types/node cross-env

```

### 2. Configuration: The "SDK Guard"

The `@openai/agents` SDK expects an `OPENAI_API_KEY`. We use the `shared/config/openrouter.ts` utility to map our OpenRouter credentials into this expected handshake format.

**Create your `.env` file:**

```env
# SDK Compatibility
OPENAI_API_KEY=sk-or-v1-your-key-here
OPENAI_BASE_URL=https://openrouter.ai/api/v1

# Course-level abstraction
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=deepseek/deepseek-r1:free

# SDK Diagnostics
OPENAI_AGENTS_DISABLE_TRACING=1
OPENAI_TELEMETRY_DISABLED=true

```

---

## 🏗 Architectural Evolution

We implement a **Shared Agent Factory** pattern (`shared/agents/recipe-agent.ts`). This centralizes client configuration, ensuring that retries, headers, and model switching occur in one place rather than being hardcoded in every lesson.

### The Resilient Runner

To handle the volatility of free-tier models, we use a custom `runWithRetry` logic that automatically cycles through a predefined `MODEL_FALLBACK_CHAIN` if an agent hits rate limits (429) or server errors.

```typescript
// Example usage in lessons
import { runWithRetry } from '../shared/agents/runner.js';

const result = await runWithRetry(
  "Chef Agent", 
  "Provide healthy recipes.", 
  "Make me a salad"
);

```

---

## 📚 Repository Structure

* **`lessons/`**: The core learning path, organized by complexity.
* **`shared/`**: Centralized logic for `recipe-agent.ts` and the `runner.ts` fallback logic.
* **`utils/`**: Helper tools like `check-available-models.js` to inspect model availability via OpenRouter API.
* **`docs/`**: Architecture deep-dives.

---

## 🚀 Running Lessons

All lessons are configured in `package.json` to handle the environment variables and diagnostic flags automatically. Use the following scripts:

* **Lesson 1:** `npm run lesson1:openrouter`
* **Lesson 2:** `npm run lesson2:openrouter-chain`
* **Lesson 3:** `npm run lesson3:openrouter`
* **Lesson 4 (Tools):** `npm run lesson4:integrated`

---

### Security Warning

🛑 **Never commit your `.env` file.** If you accidentally push a key, revoke it immediately via the OpenRouter dashboard.


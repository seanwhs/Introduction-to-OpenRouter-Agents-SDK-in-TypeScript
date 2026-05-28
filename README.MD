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

## 🔑 Obtaining Your API Keys

To bridge the OpenAI Agents SDK with OpenRouter, you need a valid OpenRouter API Key. Because the SDK is designed to be OpenAI-compatible, **your OpenRouter key functions as both variables** in this course.

### 1. Generate Your Key

1. Navigate to [OpenRouter.ai](https://openrouter.ai/).
2. Sign in or create an account.
3. Go to **Settings** -> **Keys** (or visit [openrouter.ai/keys](https://openrouter.ai/keys)).
4. Click **Create Key**.
5. Name it (e.g., "MCP-Course-Agent") and copy the value immediately. *You will not be able to see it again.*

### 2. Configure Your Environment

Create a `.env` file in your root directory. Since the OpenAI SDK expects an `OPENAI_API_KEY` to authenticate, and OpenRouter accepts this key in its custom header, use the same key for both:

```env
# Use your generated OpenRouter key for both
OPENAI_API_KEY=sk-or-v1-YOUR_COPIED_KEY_HERE
OPENROUTER_API_KEY=sk-or-v1-YOUR_COPIED_KEY_HERE

# SDK Compatibility Settings
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=deepseek/deepseek-r1:free

# SDK Diagnostics
OPENAI_AGENTS_DISABLE_TRACING=1
OPENAI_TELEMETRY_DISABLED=true

```

---

## 🚀 Quick Start

### 1. Installation

```bash
mkdir openrouter-mcp-course && cd openrouter-mcp-course
npm init -y
npm install @openai/agents dotenv zod
npm install -D typescript tsx @types/node cross-env

```

### 2. The "SDK Guard"

The `@openai/agents` SDK requires specific base URL configurations to communicate with OpenRouter instead of OpenAI servers. Ensure your shared client logic in `shared/config/openrouter.ts` initializes the client using these environment variables to maintain the handshake.

---

## 🏗 Architectural Evolution

We implement a **Shared Agent Factory** pattern. This centralizes client configuration, ensuring that retries, headers, and model switching occur in one place rather than being hardcoded in every lesson.

### The Resilient Runner

To handle the volatility of free-tier models, we use a custom `runWithRetry` logic. This automatically cycles through a `MODEL_FALLBACK_CHAIN` if an agent hits rate limits (429) or server errors.

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
* **`utils/`**: Helper tools like `check-available-models.js` to inspect model availability.
* **`docs/`**: Architecture deep-dives.

---

## 🚀 Running Lessons

All lessons are configured in `package.json` to handle environment variables and diagnostic flags automatically:

* **Lesson 1:** `npm run lesson1:openrouter`
* **Lesson 2:** `npm run lesson2:openrouter-chain`
* **Lesson 3:** `npm run lesson3:openrouter`
* **Lesson 4 (Tools):** `npm run lesson4:integrated`

---

> 🛑 **Security Warning**: Never commit your `.env` file to version control. If you accidentally push your key, revoke it immediately via the [OpenRouter Keys dashboard](https://openrouter.ai/keys).
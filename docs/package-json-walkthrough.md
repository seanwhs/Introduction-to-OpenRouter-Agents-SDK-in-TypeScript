### package.json
This `package.json` file defines the foundation for a repository focused on teaching the **OpenAI Agents SDK** with **OpenRouter** integration using TypeScript. It is structured as a modular, lesson-based course.

### 1. Project Metadata & Type

* **`"type": "module"`**: This tells Node.js to treat the project as an ES Module (ESM). This allows the use of modern `import/export` syntax instead of `require`.

### 2. Dependency Overview

* **`@openai/agents`**: The core SDK library being explored.
* **`tsx` (DevDependency)**: A powerful TypeScript execution tool that allows you to run `.ts` files directly without needing a manual compilation step (like `tsc`).
* **`cross-env`**: A critical tool for cross-platform compatibility. It ensures that the environment variables set before the script commands work consistently on Windows, macOS, and Linux.

### 3. Environment Variable Strategy

Every script uses `cross-env` to set three specific flags. These are likely used to reduce console noise and disable telemetry/tracing during the development/learning phase:

| Variable | Purpose |
| --- | --- |
| `OPENAI_TELEMETRY_DISABLED` | Prevents the SDK from sending telemetry data to OpenAI. |
| `OPENAI_AGENTS_DISABLE_TRACING` | Disables internal agent execution tracing. |
| `OPENAI_LOGGING_LEVEL` | Used in `lesson1:run` to suppress non-essential logs, keeping the terminal clean for educational output. |

### 4. Course Structure (Scripts)

The scripts are logically partitioned into two "Lessons," representing a progressive curriculum:

#### Lesson 1: Basic Agents

Focuses on the lifecycle and execution of individual agents.

* **`basic` to `runner-instance**`: Progresses from creating a simple agent definition to using "Runner" patterns (static vs. instances).
* **`stream`**: Demonstrates how to handle real-time streaming responses from an agent.
* **`openrouter`**: The pivotal lesson showing how to configure the SDK to point to OpenRouter instead of the default OpenAI API.

#### Lesson 2: Agent Results & Chaining

Focuses on data handling and complex workflows.

* **`basic-result-object` to `last-agent**`: Teaches how to introspect what an agent produced, inspect the history of the conversation, and identify specific agent outputs.
* **`chain`**: Demonstrates orchestrating multiple agents to work together.
* **`openrouter-chain`**: Combines the concepts, showing how to chain multiple agents while potentially routing them to different models via OpenRouter.

---

### How to use this repository

To interact with this project, you will use the following command structure in your terminal:

```bash
# To run a specific lesson (e.g., the streaming lesson)
npm run lesson1:stream

# To run a specific agent chain using OpenRouter
npm run lesson2:openrouter-chain

```

**Note:** Ensure you have a `.env` file in your root directory containing your `OPENROUTER_API_KEY`, as the `dotenv` package is listed in your dependencies to handle authentication for those OpenRouter-specific scripts.
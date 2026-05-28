# 📘 Lesson 2: Understanding Agent Results & Chaining Workflows

---

## Introduction & Lesson Overview

Welcome back! In Lesson 1, you learned how to fire off a simple prompt to an AI agent. Think of that like sending a text message—you send it, you get a reply, and that's it.

In this lesson, we are going to look "under the hood." Instead of just looking at the final text response, we are going to learn how to **inspect the entire life story of an agent's request.** By doing this, you will learn how to connect multiple agents together, creating a "chain" where one agent's work provides the foundation for the next.

---

## 🏗 Architectural Overview: The Agent Pipeline

When you chain agents, you are doing more than just copying and pasting text. You are moving a **State Machine**—a bundle of information that includes not just what was said, but the "reasoning" that got there—from one model to another.

---

## 🧠 The "Result Object": Your Debugging Hub

Whenever you run an agent in this SDK, it doesn't just give you a plain string of text. It gives you a **`result` object**. Think of this object like a "black box recorder" (like the ones on airplanes) that tells you exactly what happened during the flight.

### Key Pieces of Information

| Property | Think of it as... | Why you care |
| --- | --- | --- |
| `input` | The prompt you sent. | Verifies exactly what the agent received. |
| `finalOutput` | The final message. | The clean answer you show the user. |
| `history` | The transcript. | **Crucial!** This contains every "turn" in the conversation so far. |
| `newItems` | The "scratchpad." | Shows the agent's internal reasoning and steps. |
| `lastAgent` | The "who." | Identifies which agent did the work (vital if you have 5+ agents). |

---

## 🔗 Agent Chaining: The "Passing the Baton" Concept

Chaining is all about **passing context**.

Imagine you are baking a cake. You have one person (the "Recipe Agent") write the recipe, and another person (the "Blog Agent") write a story about it. If the second person doesn't see the recipe, they'll just make one up!

By passing the `history` array from the first agent to the second, the second agent "inherits" all the information from the first conversation.

### The Chaining Pattern

```typescript
// 1. Run the first agent
const recipeResult = await run(recipeAgent, "Provide a healthy smoothie recipe.");

// 2. Chain to a second agent using the first agent's history
// We use .concat() to add our new instruction to the existing conversation
const blogResult = await run(
  blogAgent, 
  recipeResult.history.concat(user("Write a blog post about this."))
);

```

---

## 🛠 Architectural Deep-Dive

### 1. Why `newItems` and `history` are different

* **`newItems`:** These are the "raw events." If your agent used a tool (like a calculator or a web search), those technical events live here. Use this when you are **debugging**—if your agent isn't doing what you expect, check here to see if it even tried to use its tools.
* **`history`:** This is the "logical flow." It stores the conversation in a simple format (User: "Hello", Assistant: "Hi"). This is what you use when you want your agent to **remember** things.

### 2. Building Resilient Pipelines

In the real world, AI models fail (maybe they are busy or the internet blips). In our code, we use a `runResiliently` function. It’s like a smart assistant that says: *"If this AI model isn't answering, I'll automatically try the next one on my list."* This keeps your application running smoothly even when the AI providers are having a bad day.

---

## 🚀 How to Run These Examples

You can try these concepts out yourself using the following commands in your terminal:

* **Basic Inspection:** `npm run lesson2:basic` (See what the result object looks like)
* **Execution Trace:** `npm run lesson2:trace` (Watch the "scratchpad" of the agent)
* **History Inspection:** `npm run lesson2:history` (See the transcript of the conversation)
* **Agent Chaining:** `npm run lesson2:chain` (Watch the baton pass from agent to agent)
* **Multi-Model Pipeline:** `npm run lesson2:openrouter-chain` (Use a smart model to think, then a creative model to write)

---

## 🧠 Mental Model Shift

* **Before:** I call a model and get a single string of text.
* **After:** I execute a structured system and manipulate its **history** to create complex, multi-step agent pipelines.

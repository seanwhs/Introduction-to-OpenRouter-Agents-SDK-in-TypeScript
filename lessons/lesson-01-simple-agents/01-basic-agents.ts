// lessons/lesson-01-simple-agents/01-basic-agents.ts
// Understand agent creation
// Inspect agent object structure
// Introduce reusable architecture

import "dotenv/config";
import { createRecipeAgent } from '../../shared/agents/recipe-agent.js';

const agent = createRecipeAgent();

console.log("=== INSPECTING AGENT OBJECT STRUCTURE ===");
console.log(agent);
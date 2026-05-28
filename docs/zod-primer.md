# Zod: The TypeScript-First Validation Toolkit

Zod is a **TypeScript-first schema declaration and validation library**. It bridges the critical gap between static compile-time type safety and the reality of runtime data (such as API responses, environment variables, or user inputs), where structures are often unpredictable.

---

## 💡 The Core Value

In TypeScript, types vanish at runtime. If you fetch data from an API, TypeScript assumes your interface is correct, but if the API returns malformed data, your application can crash. Zod provides a **single source of truth** to:

* **Validate at Runtime:** Ensure incoming data matches your expected shape.
* **Infer Static Types:** Automatically generate TypeScript interfaces from your schema, eliminating redundant code.

---

## 🛠️ Basic Usage

### 1. Define a Schema

Schemas are defined using the `z` object.

```typescript
import { z } from "zod";

const UserSchema = z.object({
  username: z.string().min(3),
  age: z.number().int().positive(),
  email: z.string().email(),
});

```

### 2. Infer the Type

Don't write interfaces manually. Let Zod generate them for you:

```typescript
type User = z.infer<typeof UserSchema>;
// Equivalent to: { username: string; age: number; email: string; }

```

### 3. Parse and Validate

* **`.parse(data)`**: Throws an error if validation fails. Use this when you expect the data to be valid.
* **`.safeParse(data)`**: Returns a result object `{ success: true, data: ... }` or `{ success: false, error: ... }`. Use this for unpredictable data.

```typescript
const result = UserSchema.safeParse(input);

if (result.success) {
  console.log("Validated data:", result.data);
} else {
  console.error("Validation failed:", result.error.format());
}

```

---

## 🚀 Advanced Concepts

### Composability

Build complex structures by nesting or combining existing schemas:

* **Arrays:** `z.array(UserSchema)`
* **Unions:** `z.union([z.string(), z.number()])`
* **Nesting:** `const PostSchema = z.object({ author: UserSchema })`

### Refinement & Transformation

* **`.refine()`**: Use for custom validation logic (e.g., ensuring a password contains an uppercase letter).
* **`.transform()`**: Modify data during parsing (e.g., converting a numeric string into a `number` or a date string into a `Date` object).

---

## 🔀 `z.discriminatedUnion`

Use this for **multiple possible object shapes** distinguished by a shared field (e.g., `type` or `status`).

```typescript
const SuccessSchema = z.object({ status: z.literal("success"), data: z.string() });
const ErrorSchema = z.object({ status: z.literal("error"), message: z.string() });

const ApiResponseSchema = z.discriminatedUnion("status", [SuccessSchema, ErrorSchema]);

```

* **Why it wins:** TypeScript automatically narrows the type based on the discriminator, enabling exhaustive `switch` statements without manual casting.

---

## 🤖 Agent-Native Validation Pattern

For agent systems (like MCP tools), use Zod to enforce a strict contract between the agent and your logic:

```typescript
async function runTool(input: unknown) {
  const parsed = ToolSchema.safeParse(input);
  
  if (!parsed.success) {
    return { type: "error", details: parsed.error.issues };
  }

  // parsed.data is now fully typed and validated
  return { type: "success", result: doWork(parsed.data) };
}

```

---

## 🏆 Why Zod Wins

Legacy libraries like Joi or Yup were built for JavaScript and lack deep TypeScript integration. Zod's **TypeScript-first** design ensures that if you update your schema, your types update instantly—drastically reducing the surface area for bugs across your entire stack.
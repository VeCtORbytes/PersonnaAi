import { createGroq } from "@ai-sdk/groq";

export const AI_CONFIG = {
  model: process.env.AI_MODEL ?? "llama-3.3-70b-versatile",
  temperature: 0.8,
  maxTokens: 1024,
} as const;

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const model = groq(AI_CONFIG.model);
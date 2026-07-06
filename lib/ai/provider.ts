import { createGroq } from "@ai-sdk/groq";

export const AI_CONFIG = {
  temperature: 0.8,
  maxTokens: 1024,
} as const;

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const CHAT_MODEL = "llama-3.3-70b-versatile";

export function getModel(modelId: string = CHAT_MODEL) {
  return groq(modelId);
}
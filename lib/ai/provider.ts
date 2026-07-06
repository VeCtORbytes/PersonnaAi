import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";

export const AI_CONFIG = {
  temperature: 0.8,
  maxTokens: 1024,
} as const;

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const CHAT_MODEL = "gpt-4o-mini";

export function getModel(modelId: string = CHAT_MODEL) {
  if (modelId.startsWith("gpt-") || modelId.startsWith("o1") || modelId.startsWith("o3")) {
    return openai(modelId);
  }
  return groq(modelId);
}
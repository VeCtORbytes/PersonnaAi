import { createGroq } from "@ai-sdk/groq";

export const AI_CONFIG = {
  temperature: 0.8,
  maxTokens: 1024,
} as const;

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Fallback chain ordered from BEST → LIGHTEST quality.
 * When a model hits a rate-limit / quota error the next one is tried.
 *
 * Supported stable production models on Groq:
 *   1. llama-3.3-70b-versatile  — best general instruction & reasoning quality
 *   2. llama-3.1-8b-instant     — ultra-fast, lighter weight
 *   3. gemma2-9b-it             — robust Google gemma fallback
 */
export const FALLBACK_CHAIN: string[] = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
];

/** Returns a LanguageModel for the given model id */
export function getModel(modelId: string) {
  return groq(modelId);
}

/** Checks if an error is a Groq rate-limit / quota error */
export function isRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;

  // Groq SDK surfaces the HTTP status on the error object
  if (e.status === 429 || e.statusCode === 429) return true;

  // Also match common string signatures
  const msg = String(e.message ?? "").toLowerCase();
  return (
    msg.includes("rate limit") ||
    msg.includes("rate_limit") ||
    msg.includes("quota") ||
    msg.includes("too many requests") ||
    msg.includes("tokens per minute") ||
    msg.includes("requests per minute")
  );
}
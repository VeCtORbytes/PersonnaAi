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
 * Quality ranking on Groq (2025):
 *   1. meta-llama/llama-4-maverick-17b  — best reasoning & instruction quality
 *   2. meta-llama/llama-4-scout-17b     — fast, near-Maverick quality
 *   3. llama-3.3-70b-versatile          — reliable heavyweight, different quota bucket
 *   4. llama-3.1-8b-instant             — ultra-fast, good for simple tasks
 *   5. gemma2-9b-it                     — last resort, stable fallback
 */
export const FALLBACK_CHAIN: string[] = [
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
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
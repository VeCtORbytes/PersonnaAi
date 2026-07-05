import { streamText } from "ai";
import { NextRequest } from "next/server";
import type { PersonaId, Message } from "@/types";
import { getPersona } from "@/data/personas/registry";
import { buildPrompt } from "@/lib/prompt/builder";
import { trimHistory } from "@/lib/memory/context";
import {
  AI_CONFIG,
  FALLBACK_CHAIN,
  getModel,
  isRateLimitError,
} from "@/lib/ai/provider";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, personaId, history, userName } = body as {
      message: string;
      personaId: PersonaId;
      history: Message[];
      userName?: string;
    };

    // Validate
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!personaId || !["hitesh", "piyush"].includes(personaId)) {
      return new Response(JSON.stringify({ error: "Invalid persona" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build context once — shared across all retry attempts
    const persona = getPersona(personaId);
    const trimmedHistory = trimHistory(history ?? [], 4000);
    // Extract first name only for a natural feel (e.g. "Sarthak" from "Sarthak Gupta")
    const firstName = userName?.split(" ")[0]?.trim() || undefined;
    const messages = buildPrompt(persona, trimmedHistory, message, firstName);

    // --- Model fallback loop ---
    let lastError: unknown = null;

    for (let i = 0; i < FALLBACK_CHAIN.length; i++) {
      const modelId = FALLBACK_CHAIN[i];

      try {
        console.log(
          `[/api/chat] Attempting model ${i + 1}/${FALLBACK_CHAIN.length}: ${modelId}`
        );

        const result = streamText({
          model: getModel(modelId),
          messages,
          temperature: AI_CONFIG.temperature,
          maxOutputTokens: AI_CONFIG.maxTokens,
          allowSystemInMessages: true,
          // Attach which model was actually used as a response header
          onFinish() {
            console.log(`[/api/chat] Completed with model: ${modelId}`);
          },
        });

        // Attach model info in a custom header so the client can display it
        const response = result.toTextStreamResponse();
        const headers = new Headers(response.headers);
        headers.set("X-Model-Used", modelId);
        if (i > 0) {
          headers.set("X-Model-Fallback", "true");
          headers.set("X-Fallback-Index", String(i));
          console.warn(
            `[/api/chat] ⚠️ Serving via fallback model (${i}): ${modelId}`
          );
        }

        return new Response(response.body, {
          status: response.status,
          headers,
        });
      } catch (err) {
        lastError = err;

        if (isRateLimitError(err)) {
          console.warn(
            `[/api/chat] Rate limit hit on model "${modelId}" — trying next fallback.`
          );
          // Immediately try the next model
          continue;
        }

        // Non-rate-limit error: don't cascade, fail fast
        console.error(`[/api/chat] Non-retryable error on model "${modelId}":`, err);
        break;
      }
    }

    // All models exhausted or non-retryable error hit
    const allExhausted =
      isRateLimitError(lastError) &&
      FALLBACK_CHAIN.every((_, idx) => idx < FALLBACK_CHAIN.length);

    console.error("[/api/chat] All models failed. Last error:", lastError);

    return new Response(
      JSON.stringify({
        error: allExhausted
          ? "All AI models are currently rate-limited. Please try again in a minute."
          : "An unexpected error occurred. Please try again.",
        code: allExhausted ? "RATE_LIMIT_ALL" : "INTERNAL_ERROR",
      }),
      {
        status: allExhausted ? 429 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[/api/chat] Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
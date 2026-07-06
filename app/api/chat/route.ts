import { streamText } from "ai";
import { NextRequest } from "next/server";
import type { PersonaId, Message } from "@/types";
import { getPersona } from "@/data/personas/registry";
import { buildPrompt } from "@/lib/prompt/builder";
import { trimHistory } from "@/lib/memory/context";
import {
  AI_CONFIG,
  CHAT_MODEL,
  getModel,
} from "@/lib/ai/provider";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let personaId: PersonaId = "hitesh";
  try {
    const body = await req.json();
    const { message, personaId: parsedPersonaId, history, userName } = body as {
      message: string;
      personaId: PersonaId;
      history: Message[];
      userName?: string;
    };
    personaId = parsedPersonaId;

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

    const persona = getPersona(personaId);
    const firstName = userName?.split(" ")[0]?.trim() || undefined;

    const isOpenAI = CHAT_MODEL.startsWith("gpt-") || CHAT_MODEL.startsWith("o1") || CHAT_MODEL.startsWith("o3");

    // For OpenAI we have high limits (200k TPM), so we can send the full prompt and history.
    // For Groq we keep it tight to prevent rate limits.
    const trimLimit = isOpenAI ? 8000 : 2000;
    const isStreamlined = !isOpenAI;

    const trimmedHistory = trimHistory(history ?? [], trimLimit);
    const messages = buildPrompt(persona, trimmedHistory, message, firstName, isStreamlined);

    console.log(`[/api/chat] Sending request to model: ${CHAT_MODEL}`);

    const result = streamText({
      model: getModel(CHAT_MODEL),
      messages,
      temperature: AI_CONFIG.temperature,
      maxOutputTokens: AI_CONFIG.maxTokens,
      allowSystemInMessages: true,
      onFinish() {
        console.log(`[/api/chat] Completed with model: ${CHAT_MODEL}`);
      },
    });

    // Eagerly trigger and await the response headers to catch connection/auth/rate-limit errors.
    await result.response;

    const response = result.toTextStreamResponse();
    const headers = new Headers(response.headers);
    headers.set("X-Model-Used", CHAT_MODEL);

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error: any) {
    console.error("[/api/chat] Error:", error);

    // Identify rate limit errors (Status 429, limit exceeded, etc.)
    const isRateLimit =
      error?.status === 429 ||
      error?.statusCode === 429 ||
      String(error?.message ?? "").toLowerCase().includes("rate limit") ||
      String(error?.message ?? "").toLowerCase().includes("limit exceeded") ||
      String(error?.message ?? "").toLowerCase().includes("tpm");

    const customMessage = personaId === "hitesh"
      ? "Lala is busy scaling systems right now! Please try again in a few seconds. 🍵"
      : "Server is heavy, mat kar lala, mat kar! 😂 Try again in a minute. 💻";

    const errorObj = {
      error: isRateLimit ? customMessage : "Something went wrong. Please try again.",
      code: isRateLimit ? "RATE_LIMIT_ALL" : "INTERNAL_ERROR",
    };

    return new Response(
      JSON.stringify(errorObj),
      {
        status: isRateLimit ? 429 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
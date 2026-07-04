import { streamText } from "ai";
import { NextRequest } from "next/server";
import type { PersonaId, Message } from "@/types";
import { getPersona } from "@/data/personas/registry";
import { buildPrompt } from "@/lib/prompt/builder";
import { trimHistory } from "@/lib/memory/context";
import { model, AI_CONFIG } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, personaId, history } = body as {
      message: string;
      personaId: PersonaId;
      history: Message[];
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

    console.log("POST request received:", { message, personaId, historyLength: history?.length });
    console.log("GROQ_API_KEY present:", !!process.env.GROQ_API_KEY);

    // Build context
    const persona = getPersona(personaId);
    const trimmedHistory = trimHistory(history ?? [], 4000);
    const messages = buildPrompt(persona, trimmedHistory, message);

    console.log("Prompt built successfully. Messages count:", messages.length);

    const result = streamText({
      model,
      messages,
      temperature: AI_CONFIG.temperature,
      maxOutputTokens: AI_CONFIG.maxTokens,
      allowSystemInMessages: true,
    });

    console.log("streamText initialized. Returning response...");
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[/api/chat]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
import { NextRequest } from "next/server";
import { generateText } from "ai";
import { CHAT_MODEL, getModel } from "@/lib/ai/provider";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { userMessage, assistantMessage } = await req.json();

    if (!userMessage || !assistantMessage) {
      return new Response(JSON.stringify({ title: "New conversation" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = `Given this conversation exchange, generate a short 3-5 word title that captures the topic. Return ONLY the title, nothing else, no quotes.\n\nUser: ${userMessage.slice(0, 200)}\nAssistant: ${assistantMessage.slice(0, 200)}\n\nTitle:`;

    try {
      const { text } = await generateText({
        model: getModel(CHAT_MODEL),
        messages: [{ role: "user", content: prompt }],
        maxOutputTokens: 20,
        temperature: 0.3,
      });

      const title = text.trim().slice(0, 40) || "New conversation";
      return new Response(JSON.stringify({ title }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.warn(`[/api/title] Error generating title:`, err);
      return new Response(JSON.stringify({ title: "New conversation" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    return new Response(JSON.stringify({ title: "New conversation" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
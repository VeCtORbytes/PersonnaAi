"use client";

import { useState, useCallback } from "react";
import type { Message, PersonaId } from "@/types";
import { generateId } from "@/utils/helpers";

export interface DebateMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  persona?: PersonaId;
  timestamp: Date;
}

export function useDebate() {
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [streamingHitesh, setStreamingHitesh] = useState("");
  const [streamingPiyush, setStreamingPiyush] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const streamPersona = async (
    persona: PersonaId,
    message: string,
    history: Message[],
    onChunk: (chunk: string) => void,
    onDone: (full: string) => void
  ) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, personaId: persona, history }),
    });

    if (!response.ok || !response.body) throw new Error(`${persona} stream failed`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onChunk(full);
    }

    onDone(full);
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: DebateMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setStreamingHitesh("");
      setStreamingPiyush("");

      const getHistory = (persona: PersonaId): Message[] =>
        messages
          .filter((m) => m.role === "user" || m.persona === persona)
          .map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          }));

      const hiteshHistory = getHistory("hitesh");
      const piyushHistory = getHistory("piyush");

      let hiteshFull = "";
      let piyushFull = "";
      let hiteshDone = false;
      let piyushDone = false;

      const checkBothDone = () => {
        if (!hiteshDone || !piyushDone) return;

        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            persona: "hitesh",
            content: hiteshFull,
            timestamp: new Date(),
          },
          {
            id: generateId(),
            role: "assistant",
            persona: "piyush",
            content: piyushFull,
            timestamp: new Date(),
          },
        ]);

        setStreamingHitesh("");
        setStreamingPiyush("");
        setIsLoading(false);
      };

      // Fire both streams concurrently
      await Promise.allSettled([
        streamPersona(
          "hitesh",
          content.trim(),
          hiteshHistory,
          (chunk) => setStreamingHitesh(chunk),
          (full) => {
            hiteshFull = full;
            hiteshDone = true;
            checkBothDone();
          }
        ),
        streamPersona(
          "piyush",
          content.trim(),
          piyushHistory,
          (chunk) => setStreamingPiyush(chunk),
          (full) => {
            piyushFull = full;
            piyushDone = true;
            checkBothDone();
          }
        ),
      ]);
    },
    [isLoading, messages]
  );

  const clearDebate = useCallback(() => {
    setMessages([]);
    setStreamingHitesh("");
    setStreamingPiyush("");
  }, []);

  return {
    messages,
    streamingHitesh,
    streamingPiyush,
    isLoading,
    sendMessage,
    clearDebate,
  };
}
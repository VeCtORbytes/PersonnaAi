"use client";

import { useState, useCallback } from "react";
import type { Message, PersonaId } from "@/types";
import { generateId } from "../utils/helpers";

type Histories = Record<PersonaId, Message[]>;

export function useChat(userName?: string) {
  const [activePersona, setActivePersona] = useState<PersonaId>("hitesh");
  const [isLoading, setIsLoading] = useState(false);
  const [histories, setHistories] = useState<Histories>({
    hitesh: [],
    piyush: [],
  });
  const [streamingContent, setStreamingContent] = useState("");

  const messages = histories[activePersona];

  const switchPersona = useCallback((personaId: PersonaId) => {
    if (!isLoading) setActivePersona(personaId);
  }, [isLoading]);

  const clearHistory = useCallback(() => {
    setHistories((prev) => ({ ...prev, [activePersona]: [] }));
  }, [activePersona]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setHistories((prev) => ({
        ...prev,
        [activePersona]: [...prev[activePersona], userMessage],
      }));

      setIsLoading(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            personaId: activePersona,
            history: histories[activePersona],
            userName,
          }),
        });

        if (!response.ok) throw new Error("Request failed");
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setStreamingContent(fullContent);
        }

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: fullContent,
          timestamp: new Date(),
        };

        setHistories((prev) => ({
          ...prev,
          [activePersona]: [...prev[activePersona], assistantMessage],
        }));
      } catch (err) {
        console.error("sendMessage error:", err);
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        };
        setHistories((prev) => ({
          ...prev,
          [activePersona]: [...prev[activePersona], errorMessage],
        }));
      } finally {
        setIsLoading(false);
        setStreamingContent("");
      }
    },
    [activePersona, histories, isLoading]
  );

  return {
    messages,
    activePersona,
    isLoading,
    streamingContent,
    sendMessage,
    switchPersona,
    clearHistory,
  };
}
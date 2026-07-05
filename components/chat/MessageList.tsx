"use client";

import { useEffect, useRef } from "react";
import type { Message, PersonaId } from "@/types";
import { MessageBubble } from "./MessageBubble";
// Animated bouncing dots typing indicator
import { TypingIndicator } from "./TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateId } from "../../utils/helpers";

interface Props {
  messages: Message[];
  activePersona: PersonaId;
  isLoading: boolean;
  streamingContent: string;
}

export function MessageList({
  messages,
  activePersona,
  isLoading,
  streamingContent,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = bottomRef.current?.closest('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const lastMessage = messages[messages.length - 1];
    const isUserMessage = lastMessage?.role === "user";
    const isAtBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 150;

    if (isUserMessage || isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, streamingContent, isLoading]);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="py-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full py-24 text-center text-muted-foreground">
            <div className="text-4xl mb-4">
              {activePersona === "hitesh" ? "🍵" : "⚡"}
            </div>
            <p className="text-lg font-medium">
              {activePersona === "hitesh"
                ? "Chai peete hain aur poochte hain!"
                : "Seedha question puchho."}
            </p>
            <p className="text-sm mt-1 opacity-70">
              {activePersona === "hitesh"
                ? "Ask Hitesh anything about JavaScript, React, or career advice."
                : "Ask Piyush about systems, architecture, or production engineering."}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            activePersona={activePersona}
          />
        ))}

        {/* Streaming message */}
        {isLoading && streamingContent && (
          <MessageBubble
            key="streaming"
            message={{
              id: generateId(),
              role: "assistant",
              content: streamingContent,
              timestamp: new Date(),
            }}
            activePersona={activePersona}
          />
        )}

        {/* Typing indicator before first token */}
        {isLoading && !streamingContent && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
"use client";

import { useEffect, useRef } from "react";
import type { Message, PersonaId } from "@/types";
import { MessageBubble } from "./MessageBubble";
// Animated bouncing dots typing indicator
import { TypingIndicator } from "./TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateId } from "../../utils/helpers";

import { getPersona } from "@/data/personas/registry";
import Image from "next/image";
import { motion } from "framer-motion";
import { TopicSuggestions } from "./TopicSuggestions";

interface Props {
  messages: Message[];
  activePersona: PersonaId;
  isLoading: boolean;
  streamingContent: string;
  onSelectSuggestion?: (s: string) => void;
}

export function MessageList({
  messages,
  activePersona,
  isLoading,
  streamingContent,
  onSelectSuggestion,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const personaConfig = getPersona(activePersona);

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
      <div className="py-4 h-full">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center min-h-[80%] py-12 text-center text-muted-foreground">
            {/* Flat Solid Avatar Border */}
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden border-3 mb-4 shadow-xs"
              style={{
                borderColor: activePersona === "hitesh" ? "#D4A76A" : "#7C3AED",
              }}
            >
              <Image
                src={personaConfig.avatar}
                alt={personaConfig.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>

            <h2 className="text-xl font-extrabold text-foreground mb-1">
              {personaConfig.name}
            </h2>
            <p className="text-xs font-semibold px-2 py-0.5 rounded-full border mb-4 bg-muted/30 border-border">
              {activePersona === "hitesh" ? "🍵 Chai aur Code" : "⚡ Systems First"}
            </p>
            <p className="text-sm text-muted-foreground max-w-md px-6 mb-8 leading-relaxed italic">
              &ldquo;{personaConfig.tagline}&rdquo;
            </p>

            {/* Suggestions centered */}
            {onSelectSuggestion && (
              <TopicSuggestions
                persona={activePersona}
                onSelect={onSelectSuggestion}
                visible={true}
                centered={true}
              />
            )}
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
"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import type { PersonaId } from "@/types";
import type { DebateMessage } from "@/hooks/useDebate";
import { cn } from "@/utils/helpers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { getPersona } from "@/data/personas/registry";
import Image from "next/image";

interface Props {
  persona: PersonaId;
  messages: DebateMessage[];
  streamingContent: string;
  isLoading: boolean;
}

const PERSONA_META = {
  hitesh: {
    emoji: "🍵",
    name: "Hitesh Choudhary",
    accent: "border-amber-500/20 bg-background/30",
    header: "bg-amber-500/[0.03] border-amber-500/10",
    badge: "text-amber-500 font-bold",
    cardBg: "bg-[#1A1916]/40 border-amber-500/10 text-foreground",
    statusDot: "bg-amber-500",
  },
  piyush: {
    emoji: "⚡",
    name: "Piyush Garg",
    accent: "border-violet-500/20 bg-background/30",
    header: "bg-violet-500/[0.03] border-violet-500/10",
    badge: "text-violet-400 font-bold",
    cardBg: "bg-[#14121A]/40 border-violet-500/10 text-foreground",
    statusDot: "bg-violet-500",
  },
};

export function DebatePanel({
  persona,
  messages,
  streamingContent,
  isLoading,
}: Props) {
  const meta = PERSONA_META[persona];
  const personaConfig = getPersona(persona);
  const bottomRef = useRef<HTMLDivElement>(null);

  const panelMessages = messages.filter(
    (m) => m.role === "user" || m.persona === persona
  );

  useEffect(() => {
    const viewport = bottomRef.current?.closest('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const lastMessage = panelMessages[panelMessages.length - 1];
    const isUserMessage = lastMessage?.role === "user";
    const isAtBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 150;

    if (isUserMessage || isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [panelMessages, streamingContent, isLoading]);

  return (
    <div
      className={cn(
        "flex flex-col flex-1 border rounded-2xl overflow-hidden",
        meta.accent
      )}
    >
      {/* Panel header */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 border-b",
          meta.header
        )}
      >
        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-border/40">
          <Image
            src={personaConfig.avatar}
            alt={personaConfig.name}
            width={24}
            height={24}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center justify-between w-full">
          <div>
            <p className={cn("text-sm font-semibold", meta.badge)}>
              {meta.name}
            </p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-1.5 bg-background/50 border border-border/60 px-2 py-0.5 rounded-full select-none">
              <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", meta.statusDot)} />
              <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Responding</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-4">
        <div className="space-y-4">
          {panelMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "text-sm rounded-xl px-4 py-3 border",
                msg.role === "user"
                  ? "bg-muted/30 text-muted-foreground italic text-xs border-border/50"
                  : meta.cardBg
              )}
            >
              {msg.role === "user" ? (
                <span>&ldquo;{msg.content}&rdquo;</span>
              ) : (
                <ReactMarkdown
                  components={{
                    code({ className, children }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg !my-2 !text-xs"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-black/20 rounded px-1 py-0.5 text-xs font-mono">
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return (
                        <p className="mb-2 last:mb-0 leading-relaxed">
                          {children}
                        </p>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </motion.div>
          ))}

          {/* Streaming */}
          {isLoading && streamingContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn("text-sm rounded-xl px-4 py-3 border", meta.cardBg)}
            >
              <ReactMarkdown>{streamingContent}</ReactMarkdown>
            </motion.div>
          )}

          {isLoading && !streamingContent && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
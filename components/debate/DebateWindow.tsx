"use client";

import { useDebate } from "@/hooks/useDebate";
import { DebatePanel } from "./DebatePanel";
import { MessageInput } from "@/components/chat/MessageInput";
import { Button } from "@/components/ui/button";
import { Trash2, Swords } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props {
  onExit: () => void;
}

export function DebateWindow({ onExit }: Props) {
  const {
    messages,
    streamingHitesh,
    streamingPiyush,
    isLoading,
    sendMessage,
    clearDebate,
  } = useDebate();

  const handleClear = () => {
    clearDebate();
    toast.success("Debate cleared");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Debate Mode</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Both perspectives. Same question.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onExit}>
            Exit Debate
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={isLoading || messages.length === 0}
            aria-label="Clear debate"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Split panels */}
      <div className="flex flex-1 gap-3 p-3 overflow-hidden">
        {/* Mobile: stacked. Desktop: side by side */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <DebatePanel
            persona="hitesh"
            messages={messages}
            streamingContent={streamingHitesh}
            isLoading={isLoading}
          />
          <DebatePanel
            persona="piyush"
            messages={messages}
            streamingContent={streamingPiyush}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Shared input */}
      <div className="border-t border-border">
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 pt-3"
          >
            <p className="text-xs text-muted-foreground mb-2">
              ⚔️ Try asking both
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                "Explain useEffect",
                "Redis vs Kafka?",
                "How to get first dev job?",
                "Monolith or microservices?",
                "Should I learn AI engineering?",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        <MessageInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
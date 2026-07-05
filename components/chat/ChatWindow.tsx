"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useChat } from "@/hooks/useChat";
import { PersonaSelector } from "@/components/persona/PersonaSelector";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { TopicSuggestions } from "@/components/chat/TopicSuggestions";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function ChatWindow() {
  const {
    messages,
    activePersona,
    isLoading,
    streamingContent,
    sendMessage,
    switchPersona,
    clearHistory,
  } = useChat();

  // Apply persona theme to root
  useEffect(() => {
    document.documentElement.setAttribute("data-persona", activePersona);
  }, [activePersona]);

  const handleClear = () => {
    clearHistory();
    toast.success("Conversation cleared");
  };

  const handleSend = (msg: string) => {
    sendMessage(msg);
  };

  return (
    <div className="flex flex-col h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Persona AI</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Chat with your favourite tech educators
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={isLoading || messages.length === 0}
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Persona Selector */}
      <PersonaSelector
        active={activePersona}
        onSwitch={switchPersona}
        disabled={isLoading}
      />

      {/* Messages */}
      <MessageList
        messages={messages}
        activePersona={activePersona}
        isLoading={isLoading}
        streamingContent={streamingContent}
      />

      {/* Topic suggestions — only when no messages */}
      <TopicSuggestions
        persona={activePersona}
        onSelect={handleSend}
        visible={messages.length === 0 && !isLoading}
      />

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
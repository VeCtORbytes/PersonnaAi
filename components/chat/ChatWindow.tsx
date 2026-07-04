"use client";

import { useChat } from "@/hooks/useChat";
import { PersonaSelector } from "@/components/persona/PersonaSelector";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { VoiceProvider } from "../../context/VoiceContext";

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

  return (
    <VoiceProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Persona AI</h1>
            <p className="text-xs text-muted-foreground">
              Chat with your favourite tech educators
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearHistory}
            disabled={isLoading || messages.length === 0}
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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

        {/* Input */}
        <MessageInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </VoiceProvider>
  );
}
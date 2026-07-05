"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useThreads } from "@/hooks/useThreads";
import { PersonaSelector } from "@/components/persona/PersonaSelector";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { TopicSuggestions } from "@/components/chat/TopicSuggestions";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DebateWindow } from "@/components/debate/DebateWindow";
import { DebateModeToggle } from "@/components/debate/DebateModeToggle";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function ChatWindow() {
  const [debateMode, setDebateMode] = useState(false);

  const {
    threads,
    activeThreadId,
    activePersona,
    messages,
    isLoading,
    streamingContent,
    sidebarOpen,
    setSidebarOpen,
    sendMessage,
    switchPersona,
    selectThread,
    deleteThread,
    newThread,
    clearThread,
  } = useThreads();

  useEffect(() => {
    document.documentElement.setAttribute("data-persona", activePersona);
  }, [activePersona]);

  const handleClear = () => {
    clearThread();
    toast.success("Conversation cleared");
  };

  const handleSend = (msg: string) => {
    sendMessage(msg);
  };

  if (debateMode) {
    return <DebateWindow onExit={() => setDebateMode(false)} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        activePersona={activePersona}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelect={selectThread}
        onDelete={(id) => {
          deleteThread(id);
          toast.success("Conversation deleted");
        }}
        onNew={() => newThread(activePersona)}
      />

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border pl-12">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Persona AI</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Chat with your favourite tech educators
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DebateModeToggle onClick={() => setDebateMode(true)} />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={isLoading || messages.length === 0}
              aria-label="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Persona selector */}
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

        {/* Topic suggestions */}
        <TopicSuggestions
          persona={activePersona}
          onSelect={handleSend}
          visible={messages.length === 0 && !isLoading}
        />

        {/* Input */}
        <MessageInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
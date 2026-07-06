"use client";

import { useState, useEffect, useRef } from "react";
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
import { CommandPalette } from "@/components/ui/CommandPalette";
import { HexagonPattern } from "@/components/ui/HexagonPattern";
import Link from "next/link";
import type { PersonaId } from "@/types";
import { Logo } from "@/components/ui/Logo";
import { Show, UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

interface ChatWindowProps {
  initialPersona?: PersonaId;
  initialDebateMode?: boolean;
  initialVoice?: boolean;
}

export function ChatWindow({
  initialPersona,
  initialDebateMode = false,
  initialVoice = false,
}: ChatWindowProps) {
  const [debateMode, setDebateMode] = useState(initialDebateMode);
  const [shortcutText, setShortcutText] = useState("⌘K");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !/Mac|iPad|iPhone|iPod/.test(navigator.userAgent)
    ) {
      setShortcutText("Ctrl+K");
    }
  }, []);

  const { user } = useUser();
  const userName = user?.fullName || undefined;

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
  } = useThreads(initialPersona, userName);

  // Synchronize active state changes back to URL query parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (debateMode) {
        if (url.searchParams.get("mode") !== "debate") {
          url.searchParams.set("mode", "debate");
          url.searchParams.delete("persona");
          window.history.replaceState(null, "", url.pathname + url.search + url.hash);
        }
      } else {
        const currentPersonaInUrl = url.searchParams.get("persona");
        const currentModeInUrl = url.searchParams.get("mode");
        if (currentModeInUrl === "debate" || currentPersonaInUrl !== activePersona) {
          url.searchParams.delete("mode");
          url.searchParams.set("persona", activePersona);
          window.history.replaceState(null, "", url.pathname + url.search + url.hash);
        }
      }
    }
  }, [activePersona, debateMode]);

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

  return (
    <>
      <CommandPalette
        activePersona={activePersona}
        debateMode={debateMode}
        onSwitchPersona={switchPersona}
        onToggleDebate={setDebateMode}
        onNewThread={() => newThread(activePersona)}
        onClearThread={handleClear}
      />
      {debateMode ? (
        <DebateWindow onExit={() => setDebateMode(false)} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex h-screen bg-background overflow-hidden relative w-full"
        >
          {/* Honeycomb Pattern */}
          <HexagonPattern />

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
          <div className="flex flex-col flex-1 min-w-0 relative z-10 bg-background">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-2 border-b border-border pl-12 bg-background">
              <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                <Logo size={22} className="group-hover:rotate-6 transition-transform duration-300" />
                <div className="flex flex-col hidden sm:flex">
                  <span className="text-sm font-extrabold tracking-tight text-foreground leading-none">
                    BrewedMinds
                  </span>
                  <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
                    ChaiCode Cohort
                  </span>
                </div>
              </Link>

              {/* Compact Persona Tab Selector in Header */}
              <div className="flex-1 max-w-[80px] sm:max-w-[200px] mx-2 sm:mx-4">
                <PersonaSelector
                  active={activePersona}
                  onSwitch={switchPersona}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <kbd className="hidden md:inline-flex h-6 select-none items-center gap-1.5 rounded border border-border bg-muted/50 px-2 font-mono text-[9px] font-medium text-muted-foreground select-none">
                  {shortcutText}
                </kbd>
                <DebateModeToggle onClick={() => setDebateMode(true)} />
                <ThemeToggle />
                <Show when="signed-in">
                  <UserButton />
                </Show>
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

            {/* Messages Area */}
            <MessageList
              messages={messages}
              activePersona={activePersona}
              isLoading={isLoading}
              streamingContent={streamingContent}
              onSelectSuggestion={handleSend}
            />

            {/* Input */}
            <MessageInput onSend={handleSend} disabled={isLoading} />

            {/* Footer attribution */}
            <footer className="text-[10px] text-muted-foreground/60 py-1.5 text-center border-t border-border-subtle bg-background/40 backdrop-blur-xs select-none">
              Built by{" "}
              <a
                href="https://github.com/VeCtORbytes"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors font-medium"
              >
                Sarthak Gupta
              </a>{" "}
              · ChaiCode GenAI Cohort
            </footer>
          </div>
        </motion.div>
      )}
    </>
  );
}
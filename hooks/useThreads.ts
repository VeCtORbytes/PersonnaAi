"use client";

import { useState, useCallback, useEffect } from "react";
import type { PersonaId, Message } from "@/types";
import {
  loadThreads,
  saveThreads,
  createThread,
  type Thread,
} from "@/lib/storage/threads";
import { generateId } from "@/utils/helpers";

async function generateTitle(
  userMessage: string,
  assistantMessage: string
): Promise<string> {
  try {
    const res = await fetch("/api/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage, assistantMessage }),
    });
    const data = await res.json();
    return data.title || "New conversation";
  } catch {
    return "New conversation";
  }
}

export function useThreads(initialPersona?: PersonaId, userName?: string) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<PersonaId>(initialPersona ?? "hitesh");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Open sidebar on desktop on initial load
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const handle = setTimeout(() => {
      const stored = loadThreads();
      if (stored.length > 0) {
        setThreads(stored);
        
        // Prioritize initialPersona if provided to prevent URL route loading race conditions
        if (initialPersona) {
          const matchingThread = stored.find((t) => t.personaId === initialPersona);
          if (matchingThread) {
            setActiveThreadId(matchingThread.id);
            setActivePersona(initialPersona);
          } else {
            const fresh = createThread(initialPersona);
            setThreads((prev) => [fresh, ...prev]);
            setActiveThreadId(fresh.id);
            setActivePersona(initialPersona);
          }
        } else {
          setActiveThreadId(stored[0].id);
          setActivePersona(stored[0].personaId);
        }
      } else {
        const defaultPersona = initialPersona ?? "hitesh";
        const initial = createThread(defaultPersona);
        setThreads([initial]);
        setActiveThreadId(initial.id);
        setActivePersona(defaultPersona);
      }
    }, 0);
    return () => clearTimeout(handle);
  }, [initialPersona]);

  // Persist on every change
  useEffect(() => {
    if (threads.length > 0) {
      saveThreads(threads);
    }
  }, [threads]);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;
  const messages = activeThread?.messages ?? [];

  const updateThread = useCallback(
    (threadId: string, updater: (t: Thread) => Thread) => {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? updater(t) : t))
      );
    },
    []
  );

  const newThread = useCallback(
    (personaId?: PersonaId) => {
      const thread = createThread(personaId ?? activePersona);
      setThreads((prev) => [thread, ...prev]);
      setActiveThreadId(thread.id);
      setActivePersona(thread.personaId);
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      return thread;
    },
    [activePersona]
  );

  const selectThread = useCallback((threadId: string) => {
    setThreads((prev) => {
      const thread = prev.find((t) => t.id === threadId);
      if (thread) setActivePersona(thread.personaId);
      return prev;
    });
    setActiveThreadId(threadId);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const deleteThread = useCallback(
    (threadId: string) => {
      setThreads((prev) => {
        const next = prev.filter((t) => t.id !== threadId);
        if (activeThreadId === threadId) {
          if (next.length > 0) {
            setActiveThreadId(next[0].id);
            setActivePersona(next[0].personaId);
          } else {
            const fresh = createThread(activePersona);
            setActiveThreadId(fresh.id);
            return [fresh];
          }
        }
        return next;
      });
    },
    [activeThreadId, activePersona]
  );

  const switchPersona = useCallback(
    (personaId: PersonaId) => {
      if (isLoading) return;
      setActivePersona(personaId);

      // Find existing empty thread for this persona, or create new
      const existing = threads.find(
        (t) => t.personaId === personaId && t.messages.length === 0
      );
      if (existing) {
        setActiveThreadId(existing.id);
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      } else {
        newThread(personaId);
      }
    },
    [isLoading, threads, newThread]
  );

  const clearThread = useCallback(() => {
    if (!activeThreadId) return;
    updateThread(activeThreadId, (t) => ({
      ...t,
      messages: [],
      title: "New conversation",
      updatedAt: new Date().toISOString(),
    }));
  }, [activeThreadId, updateThread]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading || !activeThreadId) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      // Append user message
      updateThread(activeThreadId, (t) => ({
        ...t,
        messages: [...t.messages, userMessage],
        updatedAt: new Date().toISOString(),
      }));

      setIsLoading(true);
      setStreamingContent("");

      const currentMessages = activeThread?.messages ?? [];
      const isFirstMessage = currentMessages.length === 0;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            personaId: activePersona,
            history: currentMessages,
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

        // Append assistant message
        updateThread(activeThreadId, (t) => ({
          ...t,
          messages: [...t.messages, assistantMessage],
          updatedAt: new Date().toISOString(),
        }));

        // Generate title after first exchange
        if (isFirstMessage) {
          generateTitle(content.trim(), fullContent).then((title) => {
            updateThread(activeThreadId, (t) => ({ ...t, title }));
          });
        }
      } catch (err) {
        console.error("sendMessage error:", err);
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        };
        updateThread(activeThreadId, (t) => ({
          ...t,
          messages: [...t.messages, errorMessage],
          updatedAt: new Date().toISOString(),
        }));
      } finally {
        setIsLoading(false);
        setStreamingContent("");
      }
    },
    [activeThreadId, activePersona, activeThread, isLoading, updateThread]
  );

  return {
    threads,
    activeThread,
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
  };
}
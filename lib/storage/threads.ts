import type { PersonaId, Message } from "@/types";

export interface Thread {
  id: string;
  personaId: PersonaId;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const KEY = "persona-ai:threads";

function deserializeMessages(messages: Message[]): Message[] {
  return messages.map((m) => ({
    ...m,
    timestamp: new Date(m.timestamp),
  }));
}

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: Thread[] = JSON.parse(raw);
    return parsed.map((t) => ({
      ...t,
      messages: deserializeMessages(t.messages),
    }));
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(threads));
  } catch {
    console.error("Failed to save threads to localStorage");
  }
}

export function createThread(personaId: PersonaId): Thread {
  return {
    id: Math.random().toString(36).substring(2, 9),
    personaId,
    title: "New conversation",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
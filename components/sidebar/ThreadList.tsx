"use client";

import type { Thread } from "@/lib/storage/threads";
import type { PersonaId } from "@/types";
import { ThreadItem } from "./ThreadItem";

interface Props {
  threads: Thread[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const PERSONA_META: Record<PersonaId, { emoji: string; name: string }> = {
  hitesh: { emoji: "🍵", name: "Hitesh Sir" },
  piyush: { emoji: "⚡", name: "Piyush Sir" },
};

export function ThreadList({
  threads,
  activeThreadId,
  onSelect,
  onDelete,
}: Props) {
  const grouped = {
    hitesh: threads.filter((t) => t.personaId === "hitesh"),
    piyush: threads.filter((t) => t.personaId === "piyush"),
  } as Record<PersonaId, Thread[]>;

  return (
    <div className="flex flex-col gap-4 px-2">
      {(["hitesh", "piyush"] as PersonaId[]).map((personaId) => {
        const list = grouped[personaId];
        if (list.length === 0) return null;
        const meta = PERSONA_META[personaId];
        return (
          <div key={personaId}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
              {meta.emoji} {meta.name}
            </p>
            <div className="flex flex-col gap-0.5">
              {list.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  isActive={thread.id === activeThreadId}
                  onSelect={() => onSelect(thread.id)}
                  onDelete={() => onDelete(thread.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
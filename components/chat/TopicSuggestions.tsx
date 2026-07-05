"use client";

import type { PersonaId } from "@/types";
import { cn } from "@/utils/helpers";

const SUGGESTIONS: Record<PersonaId, string[]> = {
  hitesh: [
    "Explain closures in JS",
    "How does useEffect really work?",
    "Fundamentals vs frameworks — what should I focus on?",
    "How do I get my first dev job?",
    "Tell me about your journey",
  ],
  piyush: [
    "Redis vs Kafka — when to use which?",
    "How would you design a URL shortener?",
    "Should I use microservices or monolith?",
    "How do I scale my Node.js app?",
    "Is Docker still relevant?",
  ],
};

interface Props {
  persona: PersonaId;
  onSelect: (suggestion: string) => void;
  visible: boolean;
}

export function TopicSuggestions({ persona, onSelect, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="px-4 pb-3">
      <p className="text-xs text-muted-foreground mb-2">
        💡 Suggested topics
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS[persona].map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              "border-[var(--persona-border)] text-muted-foreground",
              "hover:bg-[var(--persona-bubble)] hover:text-foreground",
              "hover:border-[var(--persona-accent)]"
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
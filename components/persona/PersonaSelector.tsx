"use client";

import type { PersonaId } from "@/types";
import { getAllPersonas } from "@/data/personas/registry";
import { cn } from "../../utils/helpers";
import Image from "next/image";

interface Props {
  active: PersonaId;
  onSwitch: (id: PersonaId) => void;
  disabled?: boolean;
}

const personas = getAllPersonas();

export function PersonaSelector({ active, onSwitch, disabled }: Props) {
  return (
    <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50 w-full h-8">
      {personas.map((persona) => {
        const isActive = persona.id === active;
        const activeColor =
          persona.id === "hitesh"
            ? "bg-[#D4A76A] text-black shadow-xs font-bold"
            : "bg-[#7C3AED] text-white shadow-xs font-bold";
        return (
          <button
            key={persona.id}
            onClick={() => onSwitch(persona.id as PersonaId)}
            disabled={disabled}
            aria-label={`Switch to ${persona.name}`}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-full rounded-md text-[11px] font-medium transition-all duration-200 cursor-pointer select-none",
              isActive
                ? activeColor
                : "text-muted-foreground hover:text-foreground hover:bg-background/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="w-3.5 h-3.5 rounded-full overflow-hidden flex-shrink-0 border border-black/10 dark:border-white/10 relative">
              <Image
                src={persona.avatar}
                alt={persona.name}
                fill
                sizes="14px"
                className="object-cover"
              />
            </div>
            <span>{persona.id === "hitesh" ? "Hitesh" : "Piyush"}</span>
          </button>
        );
      })}
    </div>
  );
}
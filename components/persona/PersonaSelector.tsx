"use client";

import type { PersonaId } from "@/types";
import { getAllPersonas } from "@/data/personas/registry";
import { cn } from "../../utils/helpers";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Props {
  active: PersonaId;
  onSwitch: (id: PersonaId) => void;
  disabled?: boolean;
}

const personas = getAllPersonas();

export function PersonaSelector({ active, onSwitch, disabled }: Props) {
  return (
    <div className="flex gap-3 p-4 border-b border-border">
      {personas.map((persona) => {
        const isActive = persona.id === active;
        return (
          <button
            key={persona.id}
            onClick={() => onSwitch(persona.id as PersonaId)}
            disabled={disabled}
            aria-label={`Switch to ${persona.name}`}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-border/40">
              <Image
                src={persona.avatar}
                alt={persona.name}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <div className="font-semibold leading-tight">{persona.name}</div>
              <div className="text-xs opacity-70 leading-tight">
                {persona.tagline.slice(0, 32)}...
              </div>
            </div>
            {isActive && (
              <Badge variant="secondary" className="ml-1 text-xs">
                Active
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
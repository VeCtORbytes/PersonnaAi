"use client";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { PersonaId } from "@/types";
import { Logo } from "@/components/ui/Logo";

function ChatWindowWrapper() {
  const searchParams = useSearchParams();
  const personaParam = searchParams.get("persona");
  const modeParam = searchParams.get("mode");
  const voiceParam = searchParams.get("voice");

  // Validate persona
  const initialPersona: PersonaId | undefined =
    personaParam === "piyush" || personaParam === "hitesh"
      ? (personaParam as PersonaId)
      : undefined;

  const initialDebateMode = modeParam === "debate";

  return (
    <ChatWindow
      initialPersona={initialPersona}
      initialDebateMode={initialDebateMode}
      initialVoice={voiceParam === "true"}
    />
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background text-foreground font-sans bg-hex-pattern">
          <div className="flex flex-col items-center gap-3">
            <Logo size={42} />
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              BrewedMinds
            </span>
            <span className="text-[10px] text-muted-foreground animate-pulse mt-0.5">Loading workspace...</span>
          </div>
        </div>
      }
    >
      <ChatWindowWrapper />
    </Suspense>
  );
}

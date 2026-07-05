"use client";

import { Volume2, Play, Pause, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PersonaId } from "@/types";
import { useVoice } from "../../context/VoiceContext";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface Props {
  messageId: string;
  text: string;
  personaId: PersonaId;
}

const PERSONA_COLOR: Record<PersonaId, string> = {
  hitesh: "#D4A76A",
  piyush: "#7C3AED",
};

export function VoiceButton({ messageId, text, personaId }: Props) {
  const {
    activeMessageId,
    playbackState,
    error,
    play,
    pause,
    resume,
    getAnalyser,
  } = useVoice();

  const isActive = activeMessageId === messageId;
  const isPlaying = isActive && playbackState === "playing";
  const isPaused = isActive && playbackState === "paused";
  const isLoading = isActive && playbackState === "loading";
  const isBuffering = isActive && playbackState === "buffering";
  const isBusy = isLoading || isBuffering;

  const handlePlayback = () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      play(messageId, text, personaId);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 items-start mt-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePlayback}
          disabled={isBusy}
          className="flex items-center gap-2 h-8 px-3 rounded-lg text-xs"
          aria-label={
            isPlaying
              ? "Pause voice playback"
              : isPaused
              ? "Resume voice playback"
              : isBusy
              ? isBuffering
                ? "Buffering voice audio"
                : "Synthesizing voice audio"
              : "Listen to message voice audio"
          }
        >
          {isBusy && <Loader2 className="h-3 w-3 animate-spin" />}
          {!isBusy && !isPlaying && !isPaused && (
            <Volume2 className="h-3.5 w-3.5" />
          )}
          {isPlaying && <Pause className="h-3.5 w-3.5" />}
          {isPaused && <Play className="h-3.5 w-3.5" />}

          {isLoading && "Synthesizing..."}
          {isBuffering && "Buffering..."}
          {!isBusy && !isPlaying && !isPaused && "Listen"}
          {isPlaying && "Pause"}
          {isPaused && "Resume"}
        </Button>

        {/* Waveform — only when actively playing */}
        {isPlaying && (
          <WaveformVisualizer
            analyser={getAnalyser()}
            isPlaying={isPlaying}
            color={PERSONA_COLOR[personaId]}
          />
        )}
      </div>

      {isActive && error && (
        <span className="text-[10px] text-destructive/80 font-medium flex items-center gap-1.5 bg-destructive/5 px-2 py-1 rounded border border-destructive/10 mt-1 max-w-[280px]">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 animate-bounce" />
          <span>{error}</span>
        </span>
      )}
    </div>
  );
}
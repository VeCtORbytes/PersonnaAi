"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import type { PersonaId } from "@/types";
import { getPersona } from "../data/personas/registry";
import { cleanTextForSpeech } from "../lib/voice/pipeline/cleaner";
import { splitTextIntoSentences } from "../lib/voice/pipeline/splitter";
import { getCachedAudio, storeCachedAudio } from "../lib/voice/pipeline/cache";
import { PlaybackQueue } from "../lib/voice/pipeline/queue";
import { AudioPlayer } from "../lib/voice/pipeline/player";
import { toast } from "sonner";

export type PlaybackState =
  | "idle"
  | "loading"
  | "buffering"
  | "playing"
  | "paused"
  | "ended"
  | "cancelled"
  | "error";

export interface VoiceMetrics {
  cacheHits: number;
  cacheMisses: number;
  synthesisCount: number;
  averageSynthesisTimeMs: number;
  retryCount: number;
  failedRequests: number;
}

interface FetchSentenceOptions {
  index: number;
  providerName: string;
  voiceId: string;
  playbackRate: number;
  personaId: PersonaId;
  signal: AbortSignal;
  queue: PlaybackQueue;
  onCacheHit: (sentence: string, index: number) => void;
  onCacheMiss: (sentence: string, index: number) => void;
  onSynthesisSuccess: (durationMs: number) => void;
  onSynthesisFailure: (error: string) => void;
  onRetryAttempt: (index: number, count: number) => void;
}

/**
 * Statically declared fetchSentence helper to comply with React Compiler purity guidelines.
 */
async function fetchSentence(options: FetchSentenceOptions) {
  const {
    index,
    providerName,
    voiceId,
    playbackRate,
    personaId,
    signal,
    queue,
    onCacheHit,
    onCacheMiss,
    onSynthesisSuccess,
    onSynthesisFailure,
    onRetryAttempt,
  } = options;

  const item = queue.getItemAt(index);
  if (!item || item.status !== "pending") return;

  item.status = "loading";
  item.abortController = new AbortController();

  const startTime = Date.now();

  try {
    // 1. Query Cache
    const cachedBlob = await getCachedAudio(
      providerName,
      voiceId,
      playbackRate,
      item.sentence
    );

    if (cachedBlob) {
      item.blob = cachedBlob;
      item.status = "ready";
      onCacheHit(item.sentence, index);
      return;
    }

    // Cache Miss path
    onCacheMiss(item.sentence, index);

    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: item.sentence, personaId }),
      signal: signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      const errText = await response.text();
      throw new Error(
        errText || `TTS synthesis failed with status ${response.status}`
      );
    }

    const blob = await response.blob();
    item.blob = blob;
    item.status = "ready";

    const duration = Date.now() - startTime;
    onSynthesisSuccess(duration);

    // Cache sentence response
    await storeCachedAudio(providerName, voiceId, playbackRate, item.sentence, blob);
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return;
    }
    console.error(`TTS fetch failure at sentence index ${index}:`, err);

    const isRateLimit = err instanceof Error && err.message === "RATE_LIMIT_EXCEEDED";

    if (!isRateLimit && item.retryCount < 1) {
      item.retryCount++;
      item.status = "pending";
      onRetryAttempt(index, item.retryCount);
      // Immediate Retry
      await fetchSentence(options);
    } else {
      item.status = "failed";
      item.errorMessage = isRateLimit ? "Too many requests. Please try again later." : String(err);
      onSynthesisFailure(item.errorMessage);
    }
  }
}

interface PrefetchLoopOptions {
  providerName: string;
  voiceId: string;
  playbackRate: number;
  personaId: PersonaId;
  signal: AbortSignal;
  queue: PlaybackQueue;
  prefetchWindow: number;
  fetchOptions: Omit<
    FetchSentenceOptions,
    | "index"
    | "signal"
    | "providerName"
    | "voiceId"
    | "playbackRate"
    | "personaId"
    | "queue"
  >;
}

/**
 * Statically declared prefetchLoop helper to fetch look-ahead items concurrently.
 */
async function prefetchLoop(options: PrefetchLoopOptions) {
  const {
    providerName,
    voiceId,
    playbackRate,
    personaId,
    signal,
    queue,
    prefetchWindow,
    fetchOptions,
  } = options;
  const currentIndex = queue.getCurrentIndex();
  const len = queue.length();

  const fetchPromises: Promise<void>[] = [];

  for (let i = 0; i < prefetchWindow; i++) {
    const targetIndex = currentIndex + i + 1;
    if (targetIndex >= len) break;

    const item = queue.getItemAt(targetIndex);
    if (item && item.status === "pending") {
      fetchPromises.push(
        fetchSentence({
          ...fetchOptions,
          index: targetIndex,
          signal,
          providerName,
          voiceId,
          playbackRate,
          personaId,
          queue,
        })
      );
    }
  }

  await Promise.all(fetchPromises);
}

interface VoiceContextType {
  activeMessageId: string | null;
  playbackState: PlaybackState;
  error: string | null;
  metrics: VoiceMetrics;
  play: (messageId: string, text: string, personaId: PersonaId) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({
  children,
  onAnalyticsEvent,
}: {
  children: React.ReactNode;
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}) {
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Expose metrics via state to resolve hooks/ref access compiler rule
  const [metrics, setMetrics] = useState<VoiceMetrics>({
    cacheHits: 0,
    cacheMisses: 0,
    synthesisCount: 0,
    averageSynthesisTimeMs: 0,
    retryCount: 0,
    failedRequests: 0,
  });

  // Core Orchestration References
  const queueRef = useRef<PlaybackQueue>(new PlaybackQueue());
  const playerRef = useRef<AudioPlayer>(new AudioPlayer());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up audio and fetch requests on unmount (copied to local variables to satisfy react-hooks rule)
  useEffect(() => {
    const activePlayer = playerRef.current;
    const activeQueue = queueRef.current;
    const currentAbortController = abortControllerRef.current;

    return () => {
      activePlayer.stop();
      activeQueue.clear();
      if (currentAbortController) {
        currentAbortController.abort();
      }
    };
  }, []);

  const trackCacheHit = (sentence: string, index: number) => {
    setMetrics((prev) => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
    onAnalyticsEvent?.("cache_hit", { sentence, index });
  };

  const trackCacheMiss = (sentence: string, index: number) => {
    setMetrics((prev) => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
    onAnalyticsEvent?.("cache_miss", { sentence, index });
  };

  const trackSynthesisSuccess = (durationMs: number) => {
    setMetrics((prev) => {
      const newCount = prev.synthesisCount + 1;
      const totalTime =
        prev.averageSynthesisTimeMs * prev.synthesisCount + durationMs;
      return {
        ...prev,
        synthesisCount: newCount,
        averageSynthesisTimeMs: Math.round(totalTime / newCount),
      };
    });
  };

  const trackSynthesisFailure = (err: string) => {
    setMetrics((prev) => ({ ...prev, failedRequests: prev.failedRequests + 1 }));
    onAnalyticsEvent?.("sentence_failed", { error: err });
  };

  const trackRetryAttempt = (index: number, count: number) => {
    setMetrics((prev) => ({ ...prev, retryCount: prev.retryCount + 1 }));
    onAnalyticsEvent?.("retry_attempt", { index, retryCount: count });
  };

  const stop = () => {
    playerRef.current.stop();
    queueRef.current.clear();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setPlaybackState("idle");
    setActiveMessageId(null);
    setError(null);
  };

  const pause = () => {
    playerRef.current.pause();
    setPlaybackState("paused");
    onAnalyticsEvent?.("playback_paused", { activeMessageId });
  };

  const resume = () => {
    playerRef.current.resume();
    setPlaybackState("playing");
    onAnalyticsEvent?.("playback_resumed", { activeMessageId });
  };

  const prefetchWindow = 2; // Prefetch next 2 items concurrently

  // Compile prefetch options once to reuse
  const buildPrefetchOptions = (
    providerName: string,
    voiceId: string,
    playbackRate: number,
    personaId: PersonaId,
    signal: AbortSignal
  ): PrefetchLoopOptions => {
    return {
      providerName,
      voiceId,
      playbackRate,
      personaId,
      signal,
      queue: queueRef.current,
      prefetchWindow,
      fetchOptions: {
        onCacheHit: trackCacheHit,
        onCacheMiss: trackCacheMiss,
        onSynthesisSuccess: trackSynthesisSuccess,
        onSynthesisFailure: trackSynthesisFailure,
        onRetryAttempt: trackRetryAttempt,
      } as Omit<
        FetchSentenceOptions,
        | "index"
        | "signal"
        | "providerName"
        | "voiceId"
        | "playbackRate"
        | "personaId"
        | "queue"
      >,
    };
  };

  // Playback queue processing cycle
  const processPlaybackQueue = async (
    providerName: string,
    voiceId: string,
    playbackRate: number,
    personaId: PersonaId,
    signal: AbortSignal
  ) => {
    const item = queueRef.current.next();
    if (!item) {
      setPlaybackState("ended");
      setActiveMessageId(null);
      onAnalyticsEvent?.("playback_ended", { activeMessageId });
      return;
    }

    // Buffer if the item hasn't fully loaded yet
    if (item.status !== "ready" && item.status !== "failed") {
      setPlaybackState("buffering");
      onAnalyticsEvent?.("playback_buffering", {
        index: queueRef.current.getCurrentIndex(),
      });
      while (
        (item.status as string) !== "ready" &&
        (item.status as string) !== "failed" &&
        !signal.aborted
      ) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    if (signal.aborted) {
      setPlaybackState("cancelled");
      return;
    }

    // Fault tolerant skip
    if (item.status === "failed") {
      if (item.errorMessage && item.errorMessage.includes("Too many requests")) {
        const sirName = personaId === "hitesh" ? "Hitesh Sir" : "Piyush Sir";
        const rateLimitMsg = `No more voice chats, watch ${sirName} video if you want!`;
        setError(rateLimitMsg);
        setPlaybackState("error");
        setActiveMessageId(null);
        if (typeof window !== "undefined") {
          const emoji = personaId === "hitesh" ? "🍵" : "💻";
          toast.warning(`Voice limit reached — go watch ${sirName} on YouTube! ${emoji}`, {
            duration: 4000,
          });
        }
        return;
      }
      console.warn("Skipping failed sentence in playback:", item.sentence);
      processPlaybackQueue(providerName, voiceId, playbackRate, personaId, signal);
      return;
    }

    if (item.blob) {
      setPlaybackState("playing");
      onAnalyticsEvent?.("sentence_started", {
        index: queueRef.current.getCurrentIndex(),
        sentence: item.sentence,
      });

      playerRef.current.play(
        item.blob,
        () => {
          // ended callback
          if (!signal.aborted) {
            processPlaybackQueue(
              providerName,
              voiceId,
              playbackRate,
              personaId,
              signal
            );
            prefetchLoop(
              buildPrefetchOptions(
                providerName,
                voiceId,
                playbackRate,
                personaId,
                signal
              )
            );
          }
        },
        (err) => {
          // error callback
          console.error("AudioPlayer playback error:", err);
          if (!signal.aborted) {
            processPlaybackQueue(
              providerName,
              voiceId,
              playbackRate,
              personaId,
              signal
            );
          }
        }
      );
    }
  };

  const play = async (messageId: string, text: string, personaId: PersonaId) => {
    if (activeMessageId === messageId) {
      if (playbackState === "paused") {
        resume();
      } else if (playbackState === "playing") {
        pause();
      }
      return;
    }

    // Stop current playbacks and clear queue state
    stop();

    setActiveMessageId(messageId);
    setPlaybackState("loading");
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const persona = getPersona(personaId);
      if (!persona.voice || !persona.voice.enabled) {
        throw new Error("Voice configuration is not enabled for this persona.");
      }

      const providerName = persona.voice.provider ?? "fish";
      const voiceId = persona.voice.voiceId ?? "";
      const playbackRate = persona.voice.playbackRate ?? 1.0;

      // Clean and split text
      const cleanedText = cleanTextForSpeech(text);
      const sentences = splitTextIntoSentences(cleanedText);

      if (sentences.length === 0) {
        throw new Error("No pronounceable text available in message.");
      }

      // Enqueue all sentences
      sentences.forEach((sentence, idx) => {
        queueRef.current.enqueue(sentence, `${messageId}_${idx}`);
      });

      onAnalyticsEvent?.("playback_started", {
        messageId,
        personaId,
        sentencesCount: sentences.length,
      });

      // Initiate parallel prefetching
      // Fetch sentence 0
      const fetchFirst = fetchSentence({
        index: 0,
        providerName,
        voiceId,
        playbackRate,
        personaId,
        signal: controller.signal,
        queue: queueRef.current,
        onCacheHit: trackCacheHit,
        onCacheMiss: trackCacheMiss,
        onSynthesisSuccess: trackSynthesisSuccess,
        onSynthesisFailure: trackSynthesisFailure,
        onRetryAttempt: trackRetryAttempt,
      });

      // Fetch subsequent sentences concurrently
      const fetchNext = prefetchLoop(
        buildPrefetchOptions(
          providerName,
          voiceId,
          playbackRate,
          personaId,
          controller.signal
        )
      );

      await Promise.all([fetchFirst, fetchNext]);

      if (controller.signal.aborted) return;

      // Start queue playback loop
      processPlaybackQueue(
        providerName,
        voiceId,
        playbackRate,
        personaId,
        controller.signal
      );
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      console.error("Play failed:", err);
      const errMsg = err instanceof Error ? err.message : "Playback failed";
      setError(errMsg);
      setPlaybackState("error");
      setActiveMessageId(null);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        activeMessageId,
        playbackState,
        error,
        metrics,
        play,
        pause,
        resume,
        stop,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
}

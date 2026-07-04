import type { PersonaId } from "@/types";

export interface SynthesizeSpeechOptions {
  text: string;
  voiceId: string;
}

export interface ProviderSpeechOptions {
  text: string;
  personaId: PersonaId;
}

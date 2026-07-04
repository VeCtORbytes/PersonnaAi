import { getPersona } from "@/data/personas/registry";
import { synthesizeSpeechFish } from "./fish";
import type { ProviderSpeechOptions } from "./types";

export async function synthesizeSpeech(
  options: ProviderSpeechOptions
): Promise<ArrayBuffer> {
  const { text, personaId } = options;
  const persona = getPersona(personaId);

  if (!persona.voice || !persona.voice.enabled) {
    throw new Error(`Voice is not enabled for persona: ${personaId}`);
  }

  const { provider, voiceId } = persona.voice;
  if (!voiceId) {
    throw new Error(`Voice ID is not configured for persona: ${personaId}`);
  }

  if (provider === "fish") {
    return await synthesizeSpeechFish({ text, voiceId });
  }

  throw new Error(`Unsupported voice provider: ${provider}`);
}

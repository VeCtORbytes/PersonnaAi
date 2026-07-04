import type { SynthesizeSpeechOptions } from "./types";

export async function synthesizeSpeechFish(
  options: SynthesizeSpeechOptions
): Promise<ArrayBuffer> {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "FISH_AUDIO_API_KEY is not configured in the environment variables"
    );
  }

  const response = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      model: process.env.FISH_AUDIO_MODEL ?? "s2.1-pro-free",
    },
    body: JSON.stringify({
      text: options.text,
      reference_id: options.voiceId,
      format: "mp3",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Fish Audio synthesis failed (${response.status}): ${text || response.statusText}`
    );
  }

  return await response.arrayBuffer();
}

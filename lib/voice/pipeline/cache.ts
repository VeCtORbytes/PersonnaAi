/**
 * Helper to compute the SHA-256 hash of a string using the native Web Crypto API.
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a structured cache key representing the TTS provider, voiceId, playbackRate, and sentence hash.
 */
export async function getCacheKey(
  provider: string,
  voiceId: string,
  playbackRate: number,
  sentence: string
): Promise<string> {
  const hash = await sha256(sentence);
  return `/api/tts?provider=${encodeURIComponent(provider)}&voiceId=${encodeURIComponent(voiceId)}&rate=${playbackRate}&hash=${hash}`;
}

/**
 * Retrieves a cached audio Blob from the Browser Cache API.
 */
export async function getCachedAudio(
  provider: string,
  voiceId: string,
  playbackRate: number,
  sentence: string
): Promise<Blob | null> {
  try {
    const cacheKey = await getCacheKey(provider, voiceId, playbackRate, sentence);
    const cache = await caches.open("persona-audio-cache");
    const response = await cache.match(cacheKey);
    if (response) {
      const rawBlob = await response.blob();
      return new Blob([rawBlob], { type: "audio/mpeg" });
    }
  } catch (err) {
    console.error("Cache retrieval failed:", err);
  }
  return null;
}

/**
 * Stores an audio Blob in the Browser Cache API.
 */
export async function storeCachedAudio(
  provider: string,
  voiceId: string,
  playbackRate: number,
  sentence: string,
  blob: Blob
): Promise<void> {
  try {
    const cacheKey = await getCacheKey(provider, voiceId, playbackRate, sentence);
    const cache = await caches.open("persona-audio-cache");
    const response = new Response(blob, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": blob.size.toString(),
      },
    });
    await cache.put(cacheKey, response);
  } catch (err) {
    console.error("Cache storage failed:", err);
  }
}

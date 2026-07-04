/**
 * Splits cleaned speech text into segments.
 *
 * Modified to return the entire message text as a single segment.
 * This sends the whole text to the TTS engine in one go, allowing the model
 * to generate natural, continuous speech flow and prosody with native pauses,
 * rather than disjointed, broken sentence fragments.
 */
export function splitTextIntoSentences(text: string): string[] {
  if (!text) return [];
  return [text.trim()];
}

/**
 * Preprocesses markdown and raw text to optimize it for server-side translation and TTS delivery.
 * Strips code blocks, formats tables, removes HTML, removes markdown symbols, and cleans up links.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // 1. Strip fenced code blocks and replace with natural placeholder
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "\n[Code example omitted]\n");

  // 2. Remove standard HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, "");

  // 3. Process markdown tables line-by-line
  const lines = cleaned.split("\n");
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (/^\|[\s\-\|:\+]+[\|\+]$/.test(trimmed)) {
        return "";
      }
      const cells = trimmed
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell !== "");
      if (cells.length > 0) {
        return cells.join(", ");
      }
      return "";
    }
    return line;
  });
  cleaned = processedLines.filter((l) => l !== "").join("\n");

  // 4. Remove inline code backticks (`code`)
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // 5. Remove markdown bold/italics
  cleaned = cleaned.replace(/[\*_]{1,3}([^*_]+)[\*_]{1,3}/g, "$1");

  // 6. Remove markdown links
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 7. Strip raw URLs
  cleaned = cleaned.replace(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
    "link"
  );

  // 8. Remove markdown headers
  cleaned = cleaned.replace(/^#+\s+/gm, "");

  // 9. Clean lists
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, "");
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, "");

  // 10. Remove blockquotes
  cleaned = cleaned.replace(/^>\s?/gm, "");

  // 11. Clean excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.trim();

  // 12. Add period if missing
  if (
    cleaned &&
    !cleaned.endsWith(".") &&
    !cleaned.endsWith("!") &&
    !cleaned.endsWith("?") &&
    !cleaned.endsWith("😂") &&
    !cleaned.endsWith("😅") &&
    !cleaned.endsWith("😌") &&
    !cleaned.endsWith("😄") &&
    !cleaned.endsWith("😊")
  ) {
    cleaned += ".";
  }

  return cleaned;
}

import type { Message } from "@/types";

// ~4 chars per token — good enough for safety trimming
// Accurate enough to prevent 429s, no tiktoken dependency needed
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function estimateMessageTokens(message: Message): number {
  // role adds ~4 tokens overhead per message
  return estimateTokens(message.content) + 4;
}

// Walks history from MOST RECENT backward.
// Stops adding when cumulative tokens would exceed budget.
// Always includes at least last 2 messages (1 full exchange).
export function trimHistory(
  messages: Message[],
  tokenBudget: number = 4000
): Message[] {
  if (messages.length === 0) return [];

  const result: Message[] = [];
  let tokenCount = 0;

  // Walk newest → oldest
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const tokens = estimateMessageTokens(msg);

    // Always keep last 2 messages regardless of budget
    const isRecentPair = i >= messages.length - 2;

    if (isRecentPair || tokenCount + tokens <= tokenBudget) {
      result.unshift(msg); // prepend to preserve order
      tokenCount += tokens;
    } else {
      // Budget exceeded — stop here
      break;
    }
  }

  return result;
}

// Returns total estimated tokens for a message array
export function getTotalTokens(messages: Message[]): number {
  return messages.reduce(
    (sum, msg) => sum + estimateMessageTokens(msg),
    0
  );
}

// Phase 2 hook — not implemented
// Will summarize dropped messages via LLM call
// Injected as first assistant message in trimmed history
export async function summarizeHistory(
  _messages: Message[],
  _personaName: string
): Promise<string> {
  throw new Error("summarizeHistory not implemented — Phase 2");
}
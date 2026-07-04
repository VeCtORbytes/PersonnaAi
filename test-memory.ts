// rough JS version — no TS needed
function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

const messages = Array.from({ length: 20 }, (_, i) => ({
  id: String(i),
  role: i % 2 === 0 ? "user" : "assistant",
  content: "This is a test message that is somewhat long to simulate real conversation content.",
  timestamp: new Date(),
}));

let tokenCount = 0;
const result = [];

for (let i = messages.length - 1; i >= 0; i--) {
  const tokens = estimateTokens(messages[i].content) + 4;
  const isRecentPair = i >= messages.length - 2;
  if (isRecentPair || tokenCount + tokens <= 4000) {
    result.unshift(messages[i]);
    tokenCount += tokens;
  } else break;
}

console.log("Original:", messages.length);
console.log("Trimmed:", result.length);
console.log("Total tokens:", tokenCount);
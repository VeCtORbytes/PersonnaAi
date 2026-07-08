import { MemoryRateLimiter } from "./memory";
import type { RateLimiter } from "./types";

// TTS Rate Limiter
const ttsLimit = parseInt(process.env.TTS_RATE_LIMIT ?? "10", 10);
const ttsWindowSec = parseInt(process.env.TTS_RATE_WINDOW ?? "60", 10);

export const rateLimiter: RateLimiter = new MemoryRateLimiter(ttsLimit, ttsWindowSec);

// Chat Rate Limiter
const chatLimit = parseInt(process.env.CHAT_RATE_LIMIT ?? "10", 10);
const chatWindowSec = parseInt(process.env.CHAT_RATE_WINDOW ?? "60", 10);

export const chatRateLimiter: RateLimiter = new MemoryRateLimiter(chatLimit, chatWindowSec);

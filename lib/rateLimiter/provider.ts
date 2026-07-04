import { MemoryRateLimiter } from "./memory";
import type { RateLimiter } from "./types";

const limit = parseInt(process.env.TTS_RATE_LIMIT ?? "10", 10);
const windowSec = parseInt(process.env.TTS_RATE_WINDOW ?? "60", 10);

export const rateLimiter: RateLimiter = new MemoryRateLimiter(limit, windowSec);

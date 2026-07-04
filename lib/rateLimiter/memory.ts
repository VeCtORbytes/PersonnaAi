import type { RateLimiter, RateLimitResult } from "./types";

export class MemoryRateLimiter implements RateLimiter {
  private store = new Map<string, number[]>();

  constructor(
    private limit: number,
    private windowSeconds: number
  ) {}

  async check(clientId: string): Promise<RateLimitResult> {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - this.windowSeconds;

    // Clean up timestamps older than the sliding window
    let clientRequests = this.store.get(clientId) ?? [];
    clientRequests = clientRequests.filter(
      (timestamp) => timestamp > windowStart
    );

    const remaining = Math.max(0, this.limit - clientRequests.length);
    const oldestTimestamp = clientRequests[0];
    const reset = oldestTimestamp ? oldestTimestamp + this.windowSeconds : now + this.windowSeconds;

    if (clientRequests.length >= this.limit) {
      this.store.set(clientId, clientRequests);
      return {
        allowed: false,
        remaining,
        reset,
        limit: this.limit,
      };
    }

    clientRequests.push(now);
    this.store.set(clientId, clientRequests);

    return {
      allowed: true,
      remaining: Math.max(0, this.limit - clientRequests.length),
      reset,
      limit: this.limit,
    };
  }
}

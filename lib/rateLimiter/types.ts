export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  limit: number;
}

export interface RateLimiter {
  check(clientId: string): Promise<RateLimitResult>;
}

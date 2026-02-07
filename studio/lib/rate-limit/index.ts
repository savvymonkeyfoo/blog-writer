/**
 * Token Bucket Rate Limiter
 *
 * Each user gets a bucket with tokens that refill over time.
 * Each API call consumes tokens.
 */

interface RateLimitConfig {
  maxTokens: number        // Maximum tokens in bucket
  refillRate: number       // Tokens added per interval
  refillInterval: number   // Interval in milliseconds
}

interface TokenBucket {
  tokens: number
  lastRefill: number
}

// In-memory store (use Redis in production for multi-instance support)
const buckets = new Map<string, TokenBucket>()

// Rate limit configurations for different operations
export const RATE_LIMITS = {
  // Ideation: 10 requests per hour
  ideation: {
    maxTokens: 10,
    refillRate: 10,
    refillInterval: 60 * 60 * 1000, // 1 hour
  },
  // Research: 10 requests per hour
  research: {
    maxTokens: 10,
    refillRate: 10,
    refillInterval: 60 * 60 * 1000,
  },
  // Writing: 20 requests per hour (includes refinements)
  writing: {
    maxTokens: 20,
    refillRate: 20,
    refillInterval: 60 * 60 * 1000,
  },
  // Image generation: 30 requests per hour
  image: {
    maxTokens: 30,
    refillRate: 30,
    refillInterval: 60 * 60 * 1000,
  },
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

function refillBucket(bucket: TokenBucket, config: RateLimitConfig): void {
  const now = Date.now()
  const timePassed = now - bucket.lastRefill
  const intervalsElapsed = Math.floor(timePassed / config.refillInterval)

  if (intervalsElapsed > 0) {
    bucket.tokens = Math.min(
      config.maxTokens,
      bucket.tokens + (intervalsElapsed * config.refillRate)
    )
    bucket.lastRefill = now
  }
}

function getBucket(identifier: string, config: RateLimitConfig): TokenBucket {
  let bucket = buckets.get(identifier)

  if (!bucket) {
    bucket = {
      tokens: config.maxTokens,
      lastRefill: Date.now(),
    }
    buckets.set(identifier, bucket)
  }

  refillBucket(bucket, config)
  return bucket
}

export interface RateLimitResult {
  allowed: boolean
  tokensRemaining: number
  retryAfter?: number // Milliseconds until next token
}

/**
 * Check if a request is allowed under rate limits
 */
export function checkRateLimit(
  identifier: string,
  type: RateLimitType,
  cost: number = 1
): RateLimitResult {
  const config = RATE_LIMITS[type]
  const bucket = getBucket(identifier, config)

  if (bucket.tokens >= cost) {
    bucket.tokens -= cost
    return {
      allowed: true,
      tokensRemaining: bucket.tokens,
    }
  }

  // Calculate retry after
  const retryAfter = config.refillInterval

  return {
    allowed: false,
    tokensRemaining: bucket.tokens,
    retryAfter,
  }
}

/**
 * Get current rate limit status without consuming tokens
 */
export function getRateLimitStatus(
  identifier: string,
  type: RateLimitType
): { tokensRemaining: number; maxTokens: number } {
  const config = RATE_LIMITS[type]
  const bucket = getBucket(identifier, config)

  return {
    tokensRemaining: bucket.tokens,
    maxTokens: config.maxTokens,
  }
}

/**
 * Reset rate limit for testing
 */
export function resetRateLimit(identifier: string): void {
  buckets.delete(identifier)
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  buckets.clear()
}

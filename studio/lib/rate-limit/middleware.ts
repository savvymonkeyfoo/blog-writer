import { headers } from 'next/headers'
import { checkRateLimit, type RateLimitType } from './index'

async function getClientIdentifier(): Promise<string> {
  const headersList = await headers()

  // Try to get user session ID (if auth is implemented)
  // For now, use IP + User-Agent as identifier
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  // Create a simple hash
  return `${ip}-${userAgent}`.substring(0, 100)
}

export interface RateLimitError {
  error: string
  rateLimited: true
  retryAfter?: number
}

/**
 * Middleware wrapper for server actions with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  type: RateLimitType,
  cost: number = 1
) {
  return function (handler: T) {
    return async function (...args: Parameters<T>): Promise<ReturnType<T> | RateLimitError> {
      const identifier = await getClientIdentifier()
      const result = checkRateLimit(identifier, type, cost)

      if (!result.allowed) {
        const retryAfterSeconds = result.retryAfter
          ? Math.ceil(result.retryAfter / 1000)
          : 3600

        return {
          error: `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`,
          rateLimited: true,
          retryAfter: retryAfterSeconds,
        } as RateLimitError
      }

      // Call the actual handler
      return handler(...args)
    } as T
  }
}

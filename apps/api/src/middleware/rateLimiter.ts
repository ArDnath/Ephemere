import { Context, Next } from 'hono'

interface RateLimiterOptions {
  windowMs: number
  max: number
  message?: string
}

// In-memory store: ip -> { count, resetTime }
const store = new Map<string, { count: number; resetTime: number }>()

export function rateLimiter(options: RateLimiterOptions) {
  const { windowMs, max, message = 'Too many requests, please try again later.' } = options

  return async (c: Context, next: Next) => {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      c.req.header('x-real-ip') ??
      'unknown'

    const now = Date.now()
    const entry = store.get(ip)

    if (!entry || now > entry.resetTime) {
      store.set(ip, { count: 1, resetTime: now + windowMs })
      await next()
      return
    }

    entry.count++
    if (entry.count > max) {
      return c.json({ message }, 429)
    }

    await next()
  }
}

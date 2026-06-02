import { Context, Next } from 'hono'
import { verifyToken } from '@/utils/jwt'
import type { JWTPayload } from '@/types/index'

export const authenticateToken = async (c: Context, next: Next) => {
  const authHeader = c.req.header('authorization')
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return c.json({ message: 'Authentication required' }, 401)
  }

  try {
    const user = await verifyToken(token)
    c.set('user', user)
    await next()
  } catch {
    return c.json({ message: 'Invalid or expired token' }, 403)
  }
}

export const requirePro = async (c: Context, next: Next) => {
  const user = c.get('user') as JWTPayload | undefined
  if (!user?.isPro) {
    return c.json({ message: 'Pro subscription required' }, 403)
  }
  await next()
}

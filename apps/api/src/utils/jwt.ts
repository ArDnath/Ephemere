import jwt from '@tsndr/cloudflare-worker-jwt'
import type { JWTPayload } from '@/types/index'

export const signToken = async (payload: JWTPayload): Promise<string> => {
  const secret = process.env.JWT_SECRET as string
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  
  return await jwt.sign(payload, secret)
}

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  const secret = process.env.JWT_SECRET as string
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  
  const isValid = await jwt.verify(token, secret)
  if (!isValid) {
    throw new Error('Invalid token')
  }
  
  const decoded = jwt.decode(token)
  return decoded.payload as JWTPayload
}

import type { User } from '../models/User.js'

// ─── Shared message envelope ────────────────────────────────────────────────

export interface WebSocketMessage {
  type: string
  payload: unknown
}

// ─── In-memory room state ────────────────────────────────────────────────────

export interface TemporaryMessage {
  id: string
  content: string
  image?: string
  userId: string
  username: string
  avatar: string
  sentAt: Date
  /** emoji → list of users who reacted */
  reactions: Record<string, { id: string; name: string; avatar: string }[]>
}

export interface Room {
  users: User[]
  maxTimeLimit: number
  maxUsers: number
  isTemporary: boolean
  /** Only populated for temporary rooms (no DB persistence) */
  lastMessages: TemporaryMessage[]
}

// ─── Data required to initialise a room slot ────────────────────────────────

export interface RoomInfo {
  id: string
  maxTimeLimit: number
  maxUsers: number
  isTemporary: boolean
}

// ─── Shapes for each client → server message type ───────────────────────────

export interface JoinPayload {
  roomId: string
  /** JWT token for authenticated users */
  token?: string
  /** Guest / temp-user fields */
  tempId?: string
  tempName?: string
  tempAvatar?: string
}

export interface SendMessagePayload {
  content: string
  /** S3 URL produced by the API presigned-URL flow */
  image?: string
}

export interface ReactPayload {
  messageId: string
  emoji: string
}

export interface RemoveReactionPayload {
  messageId: string
  emoji: string
}

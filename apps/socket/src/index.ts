import { createDb } from '@ephemere/db/factory'
import {
  messages,
  reactions,
  roomParticipants,
  rooms,
  users,
} from '@ephemere/db/schema'
import { createId } from '@paralleldrive/cuid2'
import { and, asc, eq, or } from 'drizzle-orm'

import type {
  JoinPayload,
  ReactPayload,
  RemoveReactionPayload,
  SendMessagePayload,
  TemporaryMessage,
  WebSocketMessage,
} from './types/index.js'

interface Env {
  DATABASE_URL: string
  JWT_SECRET: string
  CHAT_ROOM: DurableObjectNamespace
}

interface JwtPayload {
  userId: string
  email: string
  isPro: boolean
  exp?: number
  nbf?: number
}

interface ConnectedUser {
  id: string
  name: string
  avatar: string
  temporary: boolean
  roomId: string
  participantId: string
}

interface RoomState {
  name: string
  isTemporary: boolean
  maxTimeLimit: number
  maxUsers: number
  closedAt: Date
  lastMessages: TemporaryMessage[]
}

interface MsgRow {
  id: string
  content: string
  image: string | null
  sentAt: Date
  senderId: string
  userId: string | null
  userName: string | null
  userImage: string | null
  pTempUserId: string | null
  pTempUsername: string | null
  pTempUserImage: string | null
}

interface ReactionRow {
  messageId?: string
  emoji: string
  userId: string | null
  userName: string | null
  userImage: string | null
  pTempUserId: string | null
  pTempUsername: string | null
  pTempUserImage: string | null
}

const OPEN = 1

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.headers.get('Upgrade') !== 'websocket') {
      return Response.json({
        ok: true,
        service: '@ephemere/socket',
        transport: 'cloudflare-durable-object',
      })
    }

    const roomId = url.searchParams.get('roomId')
    if (!roomId) {
      return new Response('Missing roomId query parameter', { status: 400 })
    }

    const id = env.CHAT_ROOM.idFromName(roomId)
    return env.CHAT_ROOM.get(id).fetch(request)
  },
}

export class ChatRoom implements DurableObject {
  private readonly sockets = new Map<WebSocket, ConnectedUser>()
  private objectRoomId = ''
  private room: RoomState | null = null
  private db: ReturnType<typeof createDb>

  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Env
  ) {
    this.db = createDb(env.DATABASE_URL)
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected websocket upgrade', { status: 426 })
    }

    const requestRoomId = new URL(request.url).searchParams.get('roomId')
    if (!requestRoomId) {
      return new Response('Missing roomId query parameter', { status: 400 })
    }
    this.objectRoomId = requestRoomId

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    server.accept()

    server.addEventListener('message', (event) => {
      this.handleSocketMessage(server, event.data).catch((err: Error) => {
        console.error('[DO] Failed to handle message:', err)
        this.send(server, { type: 'error', payload: { message: 'Server error' } })
      })
    })

    server.addEventListener('close', () => {
      this.destroy(server, false).catch((err: Error) =>
        console.error('[DO] Failed to close socket:', err)
      )
    })

    server.addEventListener('error', (event) => {
      console.error('[DO] WebSocket error:', event)
      this.destroy(server, false).catch((err: Error) =>
        console.error('[DO] Failed to close errored socket:', err)
      )
    })

    return new Response(null, { status: 101, webSocket: client })
  }

  private async handleSocketMessage(
    socket: WebSocket,
    raw: string | ArrayBuffer
  ): Promise<void> {
    const data = JSON.parse(
      typeof raw === 'string' ? raw : new TextDecoder().decode(raw)
    ) as { type: string; payload: unknown }

    switch (data.type) {
      case 'join':
        await this.handleJoin(socket, data.payload as JoinPayload)
        break
      case 'send_message':
        await this.handleSendMessage(socket, data.payload as SendMessagePayload)
        break
      case 'react':
        await this.handleReact(socket, data.payload as ReactPayload)
        break
      case 'remove_reaction':
        await this.handleRemoveReaction(
          socket,
          data.payload as RemoveReactionPayload
        )
        break
      case 'leave':
        await this.destroy(socket, true)
        break
      default:
        this.send(socket, {
          type: 'error',
          payload: { message: `Unknown message type: ${data.type}` },
        })
    }
  }

  private async handleJoin(
    socket: WebSocket,
    payload: JoinPayload
  ): Promise<void> {
    const { roomId, token, tempId, tempName, tempAvatar } = payload

    if (!roomId) {
      this.sendErrorAndClose(socket, 'Room ID is required')
      return
    }

    if (roomId !== this.objectRoomId) {
      this.sendErrorAndClose(socket, 'Room ID does not match connection')
      return
    }

    const room = await this.loadRoom(roomId)
    if (!room) {
      this.sendErrorAndClose(socket, 'Room not found')
      return
    }

    if (room.closedAt && room.closedAt < new Date()) {
      this.sendErrorAndClose(socket, 'Room is closed')
      return
    }

    let user: ConnectedUser
    if (token) {
      const decoded = await verifyJwt(token, this.env.JWT_SECRET).catch(() => null)
      if (!decoded?.userId) {
        this.sendErrorAndClose(socket, 'Invalid or expired token')
        return
      }

      const [dbUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1)

      if (!dbUser) {
        this.sendErrorAndClose(socket, 'Invalid or expired token')
        return
      }

      user = {
        id: dbUser.id,
        name: dbUser.name,
        avatar: dbUser.image ?? '',
        temporary: false,
        roomId,
        participantId: '',
      }
    } else if (tempId && tempName && tempAvatar) {
      user = {
        id: tempId,
        name: tempName,
        avatar: tempAvatar,
        temporary: true,
        roomId,
        participantId: '',
      }
    } else {
      this.sendErrorAndClose(
        socket,
        'Authentication required: provide a token or guest credentials'
      )
      return
    }

    const alreadyInRoom = [...this.sockets.values()].some((u) => u.id === user.id)
    if (alreadyInRoom) {
      this.sendErrorAndClose(socket, 'You are already connected to this room')
      return
    }

    if (this.sockets.size >= room.maxUsers) {
      this.sendErrorAndClose(socket, 'Room is full')
      return
    }

    user.participantId = await this.upsertParticipant(user, roomId)
    this.sockets.set(socket, user)

    const lastMessages = room.isTemporary
      ? this.buildTempMessages(user.id)
      : await this.loadPersistentMessages(roomId, user.id)

    this.broadcast(
      {
        type: 'user_joined',
        payload: {
          userId: user.id,
          username: user.name,
          avatar: user.avatar,
          temporary: user.temporary,
        },
      },
      socket
    )

    this.send(socket, {
      type: 'room_joined',
      payload: {
        userId: user.id,
        participantId: user.participantId,
        roomName: room.name,
        maxUsers: room.maxUsers,
        maxTimeLimit: room.maxTimeLimit,
        isTemporary: room.isTemporary,
        closeTime: room.closedAt,
        users: [...this.sockets.values()].map((u) => ({
          userId: u.id,
          username: u.name,
          avatar: u.avatar,
          temporary: u.temporary,
        })),
        lastMessages,
      },
    })
  }

  private async handleSendMessage(
    socket: WebSocket,
    payload: SendMessagePayload
  ): Promise<void> {
    const user = this.sockets.get(socket)
    if (!user || !this.room) return

    const { content, image } = payload
    if (!content?.trim() && !image) {
      this.send(socket, {
        type: 'error',
        payload: { message: 'Message must have content or an image' },
      })
      return
    }

    const messageId = createId()
    const sentAt = new Date()
    const messagePayload = {
      id: messageId,
      content: content?.trim() ?? '',
      ...(image && { image }),
      userId: user.id,
      username: user.name,
      avatar: user.avatar,
      sentAt,
      reactions: {} as Record<string, { id: string; name: string; avatar: string }[]>,
    }

    if (this.room.isTemporary) {
      this.room.lastMessages.push(messagePayload)
    } else {
      if (!user.participantId) return
      await this.db
        .insert(messages)
        .values({
          id: messageId,
          content: content?.trim() ?? '',
          ...(image && { image }),
          sentAt,
          roomId: user.roomId,
          senderId: user.participantId,
        })
        .catch((err: Error) =>
          console.error('[DO] Failed to persist message:', err)
        )
    }

    this.broadcastToAll({ type: 'new_message', payload: messagePayload })
  }

  private async handleReact(
    socket: WebSocket,
    payload: ReactPayload
  ): Promise<void> {
    await this.updateReaction(socket, payload, 'add')
  }

  private async handleRemoveReaction(
    socket: WebSocket,
    payload: RemoveReactionPayload
  ): Promise<void> {
    await this.updateReaction(socket, payload, 'remove')
  }

  private async updateReaction(
    socket: WebSocket,
    payload: ReactPayload | RemoveReactionPayload,
    action: 'add' | 'remove'
  ): Promise<void> {
    const user = this.sockets.get(socket)
    if (!user || !this.room) return

    const { messageId, emoji } = payload
    if (!messageId || !emoji) {
      this.send(socket, {
        type: 'error',
        payload: { message: 'messageId and emoji are required' },
      })
      return
    }

    if (this.room.isTemporary) {
      this.updateTemporaryMessageReaction(messageId, emoji, user, action)
    } else if (action === 'add') {
      if (!user.participantId) return
      await this.db
        .insert(reactions)
        .values({
          emoji,
          messageId,
          senderId: user.participantId,
          roomId: user.roomId,
        })
        .onConflictDoNothing()
        .catch((err: Error) =>
          console.error('[DO] Failed to persist reaction:', err)
        )
    } else {
      if (!user.participantId) return
      await this.db
        .delete(reactions)
        .where(
          and(
            eq(reactions.messageId, messageId),
            eq(reactions.senderId, user.participantId),
            eq(reactions.emoji, emoji)
          )
        )
        .catch((err: Error) =>
          console.error('[DO] Failed to delete reaction:', err)
        )
    }

    const updatedReactions = await this.getReactionsForMessage(messageId)
    this.broadcastToAll({
      type: 'reaction_updated',
      payload: { messageId, reactions: updatedReactions },
    })
  }

  private async loadRoom(roomId: string): Promise<RoomState | null> {
    if (this.room) return this.room

    if (roomId === 'public') {
      this.room = {
        name: 'Public Chat Room',
        isTemporary: true,
        maxTimeLimit: 999999,
        maxUsers: 10000,
        closedAt: new Date(Date.now() + 999999 * 60 * 1000),
        lastMessages: [],
      }
      return this.room
    }

    const [dbRoom] = await this.db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1)

    if (!dbRoom) return null

    this.room = {
      name: dbRoom.name,
      isTemporary: dbRoom.isTemporary,
      maxTimeLimit: dbRoom.maxTimeLimit,
      maxUsers: dbRoom.maxUsers,
      closedAt: dbRoom.closedAt ?? new Date(Date.now() + dbRoom.maxTimeLimit * 60 * 1000),
      lastMessages: [],
    }
    return this.room
  }

  private async upsertParticipant(
    user: ConnectedUser,
    roomId: string
  ): Promise<string> {
    if (roomId === 'public') return ''

    const whereClause = user.temporary
      ? and(
          eq(roomParticipants.roomId, roomId),
          eq(roomParticipants.tempUserId, user.id)
        )
      : and(eq(roomParticipants.roomId, roomId), eq(roomParticipants.userId, user.id))

    const [existing] = await this.db
      .select()
      .from(roomParticipants)
      .where(whereClause!)
      .limit(1)

    if (existing) {
      await this.db
        .update(roomParticipants)
        .set({ leftAt: null, joinedAt: new Date() })
        .where(eq(roomParticipants.id, existing.id))
      return existing.id
    }

    const [inserted] = await this.db
      .insert(roomParticipants)
      .values({
        roomId,
        ...(user.temporary
          ? {
              tempUserId: user.id,
              tempUsername: user.name,
              tempUserImage: user.avatar,
            }
          : { userId: user.id }),
      })
      .returning()

    return inserted!.id
  }

  private async destroy(socket: WebSocket, selfInitiated: boolean): Promise<void> {
    const user = this.sockets.get(socket)
    if (!user) {
      socket.close()
      return
    }

    this.sockets.delete(socket)

    if (user.roomId !== 'public') {
      const whereClause = user.temporary
        ? and(
            eq(roomParticipants.roomId, user.roomId),
            eq(roomParticipants.tempUserId, user.id)
          )
        : and(
            eq(roomParticipants.roomId, user.roomId),
            eq(roomParticipants.userId, user.id)
          )

      await this.db
        .update(roomParticipants)
        .set({ leftAt: new Date() })
        .where(whereClause!)
        .catch((err: Error) =>
          console.error('[DO] Failed to stamp leftAt:', err)
        )
    }

    this.broadcast({ type: 'user_left', payload: { userId: user.id } }, socket)

    if (selfInitiated) {
      this.send(socket, { type: 'self_leave', payload: { userId: user.id } })
    }

    if (this.sockets.size === 0 && user.roomId !== 'public') {
      this.room = null
    }

    socket.close()
  }

  private broadcast(data: WebSocketMessage, sender: WebSocket): void {
    for (const socket of this.sockets.keys()) {
      if (socket !== sender) this.send(socket, data)
    }
  }

  private broadcastToAll(data: WebSocketMessage): void {
    for (const socket of this.sockets.keys()) {
      this.send(socket, data)
    }
  }

  private send(socket: WebSocket, data: WebSocketMessage): void {
    if (socket.readyState === OPEN) {
      socket.send(JSON.stringify(data))
    }
  }

  private sendErrorAndClose(socket: WebSocket, message: string): void {
    this.send(socket, { type: 'error', payload: { message } })
    socket.close()
  }

  private buildTempMessages(userId: string): TemporaryMessage[] {
    return (
      this.room?.lastMessages.map((msg) => ({
        ...msg,
        userEmoji:
          Object.entries(msg.reactions).find(([, reactionUsers]) =>
            reactionUsers.some((u) => u.id === userId)
          )?.[0] ?? '',
      })) ?? []
    )
  }

  private updateTemporaryMessageReaction(
    messageId: string,
    emoji: string,
    user: ConnectedUser,
    action: 'add' | 'remove'
  ): void {
    const msg = this.room?.lastMessages.find((m) => m.id === messageId)
    if (!msg) return

    if (!msg.reactions[emoji]) msg.reactions[emoji] = []
    if (action === 'add') {
      const already = msg.reactions[emoji]!.some((u) => u.id === user.id)
      if (!already) {
        msg.reactions[emoji]!.push({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        })
      }
      return
    }

    msg.reactions[emoji] = msg.reactions[emoji]!.filter((u) => u.id !== user.id)
    if (msg.reactions[emoji]!.length === 0) delete msg.reactions[emoji]
  }

  private async loadPersistentMessages(
    roomId: string,
    userId: string
  ): Promise<object[]> {
    const msgs = await this.db
      .select({
        id: messages.id,
        content: messages.content,
        image: messages.image,
        sentAt: messages.sentAt,
        senderId: messages.senderId,
        userId: users.id,
        userName: users.name,
        userImage: users.image,
        pTempUserId: roomParticipants.tempUserId,
        pTempUsername: roomParticipants.tempUsername,
        pTempUserImage: roomParticipants.tempUserImage,
      })
      .from(messages)
      .innerJoin(roomParticipants, eq(messages.senderId, roomParticipants.id))
      .leftJoin(users, eq(roomParticipants.userId, users.id))
      .where(eq(messages.roomId, roomId))
      .orderBy(asc(messages.sentAt))

    if (msgs.length === 0) return []

    const msgIds = msgs.map((m: MsgRow) => m.id)
    const allReactions = await this.db
      .select({
        messageId: reactions.messageId,
        emoji: reactions.emoji,
        userId: users.id,
        userName: users.name,
        userImage: users.image,
        pTempUserId: roomParticipants.tempUserId,
        pTempUsername: roomParticipants.tempUsername,
        pTempUserImage: roomParticipants.tempUserImage,
      })
      .from(reactions)
      .innerJoin(roomParticipants, eq(reactions.senderId, roomParticipants.id))
      .leftJoin(users, eq(roomParticipants.userId, users.id))
      .where(
        msgIds.length === 1
          ? eq(reactions.messageId, msgIds[0]!)
          : or(...msgIds.map((id: string) => eq(reactions.messageId, id)))
      )

    return msgs.map((msg: MsgRow) => {
      const msgReactions = allReactions.filter(
        (r: ReactionRow) => r.messageId === msg.id
      )

      const reactionMap = msgReactions.reduce(
        (
          acc: Record<string, { id: string; name: string; avatar: string }[]>,
          r: ReactionRow
        ) => {
          const rUser = {
            id: r.userId ?? r.pTempUserId ?? '',
            name: r.userName ?? r.pTempUsername ?? '',
            avatar: r.userImage ?? r.pTempUserImage ?? '',
          }
          if (!acc[r.emoji]) acc[r.emoji] = []
          acc[r.emoji]!.push(rUser)
          return acc
        },
        {} as Record<string, { id: string; name: string; avatar: string }[]>
      )

      const myEmoji =
        msgReactions.find(
          (r: ReactionRow) => (r.userId ?? r.pTempUserId) === userId && r.emoji
        )?.emoji ?? ''

      return {
        id: msg.id,
        content: msg.content,
        ...(msg.image && { image: msg.image }),
        userId: msg.userId ?? msg.pTempUserId ?? '',
        username: msg.userName ?? msg.pTempUsername ?? '',
        avatar: msg.userImage ?? msg.pTempUserImage ?? '',
        sentAt: msg.sentAt,
        userEmoji: myEmoji,
        reactions: reactionMap,
      }
    })
  }

  private async getReactionsForMessage(
    messageId: string
  ): Promise<Record<string, { id: string; name: string; avatar: string }[]>> {
    if (this.room?.isTemporary) {
      return this.room.lastMessages.find((m) => m.id === messageId)?.reactions ?? {}
    }

    const rows = await this.db
      .select({
        emoji: reactions.emoji,
        userId: users.id,
        userName: users.name,
        userImage: users.image,
        pTempUserId: roomParticipants.tempUserId,
        pTempUsername: roomParticipants.tempUsername,
        pTempUserImage: roomParticipants.tempUserImage,
      })
      .from(reactions)
      .innerJoin(roomParticipants, eq(reactions.senderId, roomParticipants.id))
      .leftJoin(users, eq(roomParticipants.userId, users.id))
      .where(eq(reactions.messageId, messageId))

    return rows.reduce(
      (
        acc: Record<string, { id: string; name: string; avatar: string }[]>,
        r: ReactionRow
      ) => {
        const rUser = {
          id: r.userId ?? r.pTempUserId ?? '',
          name: r.userName ?? r.pTempUsername ?? '',
          avatar: r.userImage ?? r.pTempUserImage ?? '',
        }
        if (!acc[r.emoji]) acc[r.emoji] = []
        acc[r.emoji]!.push(rUser)
        return acc
      },
      {} as Record<string, { id: string; name: string; avatar: string }[]>
    )
  }
}

async function verifyJwt(token: string, secret: string): Promise<JwtPayload> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Invalid JWT')
  }

  const header = JSON.parse(base64UrlDecodeToString(encodedHeader)) as {
    alg?: string
  }
  if (header.alg !== 'HS256') {
    throw new Error('Unsupported JWT algorithm')
  }

  const data = `${encodedHeader}.${encodedPayload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlDecodeToArrayBuffer(encodedSignature),
    new TextEncoder().encode(data)
  )

  if (!valid) throw new Error('Invalid JWT signature')

  const payload = JSON.parse(base64UrlDecodeToString(encodedPayload)) as JwtPayload
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp <= now) throw new Error('Expired JWT')
  if (payload.nbf && payload.nbf > now) throw new Error('JWT not active')
  return payload
}

function base64UrlDecodeToString(value: string): string {
  return new TextDecoder().decode(base64UrlDecodeToBytes(value))
}

function base64UrlDecodeToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '='
  )
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function base64UrlDecodeToArrayBuffer(value: string): ArrayBuffer {
  const bytes = base64UrlDecodeToBytes(value)
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

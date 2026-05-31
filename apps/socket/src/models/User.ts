import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { WebSocket } from 'ws'
import { createId } from '@paralleldrive/cuid2'
import { db } from '@ephemere/db'
import {
  users,
  rooms,
  messages,
  reactions,
  roomParticipants,
} from '@ephemere/db/schema'
import { and, asc, eq, or } from 'drizzle-orm'
import { RoomManager } from './RoomManager.js'
import type {
  JoinPayload,
  ReactPayload,
  RemoveReactionPayload,
  SendMessagePayload,
  TemporaryMessage,
  WebSocketMessage,
} from '../types/index.js'

interface JwtPayload {
  userId: string
  email: string
  isPro: boolean
}

/** Shape of a message row returned by the persistent-room query */
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

/** Shape of a reaction row returned by the DB queries */
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

/**
 * Represents a single connected WebSocket client.
 *
 * Lifecycle:
 *   1. Created on `connection` – identity fields are empty.
 *   2. Client sends `join` – identity is resolved (JWT or temp guest).
 *   3. Client sends `send_message` / `react` / `remove_reaction` / `leave`.
 *   4. On `close` → `destroy()` stamps leftAt and broadcasts `user_left`.
 */
export class User {
  public id: string = ''
  public name: string = ''
  public avatar: string = ''
  public temporary: boolean = true
  public roomId: string = ''
  /** DB primary-key of the roomParticipants row; set by RoomManager.addUser */
  public participantId: string = ''

  constructor(private readonly ws: WebSocket) {
    this.initHandlers()
  }

  // ─── Internal helpers ────────────────────────────────────────────────────

  private initHandlers(): void {
    this.ws.on('message', async (raw: Buffer) => {
      try {
        const data = JSON.parse(raw.toString()) as {
          type: string
          payload: unknown
        }
        await this.handleMessage(data.type, data.payload)
      } catch (err) {
        console.error('[User] Failed to handle message:', err)
      }
    })

    this.ws.on('close', () => {
      this.destroy().catch((err) =>
        console.error('[User] destroy() failed:', err)
      )
    })

    this.ws.on('error', (err: Error) => {
      console.error('[User] WebSocket error:', err)
    })
  }

  private async handleMessage(type: string, payload: unknown): Promise<void> {
    switch (type) {
      case 'join':
        await this.handleJoin(payload as JoinPayload)
        break
      case 'send_message':
        await this.handleSendMessage(payload as SendMessagePayload)
        break
      case 'react':
        await this.handleReact(payload as ReactPayload)
        break
      case 'remove_reaction':
        await this.handleRemoveReaction(payload as RemoveReactionPayload)
        break
      case 'leave':
        await this.destroy()
        break
      default:
        console.warn('[User] Unknown message type:', type)
    }
  }

  // ─── join ────────────────────────────────────────────────────────────────

  private async handleJoin(payload: JoinPayload): Promise<void> {
    const { roomId, token, tempId, tempName, tempAvatar } = payload

    if (!roomId) {
      this.sendError('Room ID is required')
      this.ws.close()
      return
    }

    // ── 1. Load room from DB ──────────────────────────────────────────────
    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1)

    if (!room) {
      this.sendError('Room not found')
      this.ws.close()
      return
    }

    if (room.closedAt && room.closedAt < new Date()) {
      this.sendError('Room is closed')
      this.ws.close()
      return
    }

    // ── 2. Resolve user identity ──────────────────────────────────────────
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET ?? 'your_jwt_secret'
        ) as JwtPayload

        if (!decoded.userId) {
          this.ws.close()
          return
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1)

        if (!user) {
          this.ws.close()
          return
        }

        this.id = user.id
        this.name = user.name
        this.avatar = user.image ?? ''
        this.temporary = false
      } catch {
        this.sendError('Invalid or expired token')
        this.ws.close()
        return
      }
    } else if (tempId && tempName && tempAvatar) {
      this.id = tempId
      this.name = tempName
      this.avatar = tempAvatar
      this.temporary = true
    } else {
      this.sendError('Authentication required: provide a token or guest credentials')
      this.ws.close()
      return
    }

    // ── 3. Guard: prevent duplicate connections ────────────────────────────
    const alreadyInRoom = RoomManager.getInstance()
      .rooms.get(roomId)
      ?.users.find((u) => u.id === this.id)

    if (alreadyInRoom) {
      this.sendError('You are already connected to this room')
      this.ws.close()
      return
    }

    // ── 4. Add to RoomManager (enforces maxUsers, writes DB participant) ───
    const joined = await RoomManager.getInstance().addUser(this, {
      id: room.id,
      isTemporary: room.isTemporary,
      maxTimeLimit: room.maxTimeLimit,
      maxUsers: room.maxUsers,
    })

    if (!joined) {
      this.sendError('Room is full')
      this.ws.close()
      return
    }

    this.roomId = room.id

    // ── 5. Load message history ───────────────────────────────────────────
    const lastMessages = room.isTemporary
      ? this.buildTempMessages(roomId)
      : await this.loadPersistentMessages(roomId)

    // ── 6. Broadcast user_joined to others ────────────────────────────────
    RoomManager.getInstance().broadcast(
      {
        type: 'user_joined',
        payload: {
          userId: this.id,
          username: this.name,
          avatar: this.avatar,
          temporary: this.temporary,
        },
      },
      this,
      roomId
    )

    // ── 7. Send room_joined to this client ────────────────────────────────
    this.send({
      type: 'room_joined',
      payload: {
        userId: this.id,
        participantId: this.participantId,
        roomName: room.name,
        maxUsers: room.maxUsers,
        maxTimeLimit: room.maxTimeLimit,
        isTemporary: room.isTemporary,
        closeTime: room.closedAt,
        users: RoomManager.getInstance()
          .rooms.get(roomId)
          ?.users.map((u) => ({
            userId: u.id,
            username: u.name,
            avatar: u.avatar,
            temporary: u.temporary,
          })) ?? [],
        lastMessages,
      },
    })
  }

  // ─── send_message ────────────────────────────────────────────────────────

  private async handleSendMessage(payload: SendMessagePayload): Promise<void> {
    if (!this.roomId) return
    const { content, image } = payload

    if (!content?.trim() && !image) {
      this.sendError('Message must have content or an image')
      return
    }

    const isTemporary = RoomManager.getInstance().rooms.get(this.roomId)?.isTemporary

    const messageId = createId()
    const sentAt = new Date()

    const messagePayload = {
      id: messageId,
      content: content?.trim() ?? '',
      ...(image && { image }),
      userId: this.id,
      username: this.name,
      avatar: this.avatar,
      sentAt,
      reactions: {} as Record<string, { id: string; name: string; avatar: string }[]>,
    }

    if (isTemporary) {
      // ── In-memory only ────────────────────────────────────────────────
      RoomManager.getInstance().addTemporaryMessage(this.roomId, messagePayload)
    } else {
      // ── Persist to DB ─────────────────────────────────────────────────
      if (!this.participantId) {
        console.error('[User] Cannot send message: participantId not set')
        return
      }
      await db
        .insert(messages)
        .values({
          id: messageId,
          content: content?.trim() ?? '',
          ...(image && { image }),
          sentAt,
          roomId: this.roomId,
          senderId: this.participantId,
        })
        .catch((err: Error) => console.error('[User] Failed to persist message:', err))
    }

    // ── Broadcast to entire room (including sender so they see their own msg confirmed) ──
    RoomManager.getInstance().broadcastToAll(
      { type: 'new_message', payload: messagePayload },
      this.roomId
    )
  }

  // ─── react ───────────────────────────────────────────────────────────────

  private async handleReact(payload: ReactPayload): Promise<void> {
    if (!this.roomId) return
    const { messageId, emoji } = payload

    if (!messageId || !emoji) {
      this.sendError('messageId and emoji are required')
      return
    }

    const reactionUser = { id: this.id, name: this.name, avatar: this.avatar }
    const isTemporary = RoomManager.getInstance().rooms.get(this.roomId)?.isTemporary

    if (isTemporary) {
      RoomManager.getInstance().updateTemporaryMessageReaction(
        this.roomId,
        messageId,
        emoji,
        reactionUser,
        'add'
      )
    } else {
      if (!this.participantId) return
      // Upsert: if same (emoji, messageId, senderId) already exists, do nothing
      await db
        .insert(reactions)
        .values({
          emoji,
          messageId,
          senderId: this.participantId,
          roomId: this.roomId,
        })
        .onConflictDoNothing()
        .catch((err: Error) => console.error('[User] Failed to persist reaction:', err))
    }

    // Build updated reaction map and broadcast
    const updatedReactions = await this.getReactionsForMessage(messageId)

    RoomManager.getInstance().broadcastToAll(
      {
        type: 'reaction_updated',
        payload: { messageId, reactions: updatedReactions },
      },
      this.roomId
    )
  }

  // ─── remove_reaction ─────────────────────────────────────────────────────

  private async handleRemoveReaction(payload: RemoveReactionPayload): Promise<void> {
    if (!this.roomId) return
    const { messageId, emoji } = payload

    if (!messageId || !emoji) {
      this.sendError('messageId and emoji are required')
      return
    }

    const reactionUser = { id: this.id, name: this.name, avatar: this.avatar }
    const isTemporary = RoomManager.getInstance().rooms.get(this.roomId)?.isTemporary

    if (isTemporary) {
      RoomManager.getInstance().updateTemporaryMessageReaction(
        this.roomId,
        messageId,
        emoji,
        reactionUser,
        'remove'
      )
    } else {
      if (!this.participantId) return
      await db
        .delete(reactions)
        .where(
          and(
            eq(reactions.messageId, messageId),
            eq(reactions.senderId, this.participantId),
            eq(reactions.emoji, emoji)
          )
        )
        .catch((err: Error) => console.error('[User] Failed to delete reaction:', err))
    }

    const updatedReactions = await this.getReactionsForMessage(messageId)

    RoomManager.getInstance().broadcastToAll(
      {
        type: 'reaction_updated',
        payload: { messageId, reactions: updatedReactions },
      },
      this.roomId
    )
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  public send(data: WebSocketMessage): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  public async destroy(): Promise<void> {
    if (this.roomId) {
      await RoomManager.getInstance().removeUser(this.roomId, this)

      RoomManager.getInstance().broadcast(
        {
          type: 'user_left',
          payload: { userId: this.id },
        },
        this,
        this.roomId
      )

      this.send({
        type: 'self_leave',
        payload: { userId: this.id },
      })

      this.roomId = ''
    }

    if (this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close()
    }
  }

  // ─── Private data helpers ────────────────────────────────────────────────

  /** Return in-memory messages for a temporary room, annotated with the current user's emoji. */
  private buildTempMessages(roomId: string): TemporaryMessage[] {
    const room = RoomManager.getInstance().rooms.get(roomId)
    if (!room) return []
    return room.lastMessages.map((msg) => ({
      ...msg,
      userEmoji:
        Object.entries(msg.reactions).find(([, users]) =>
          users.some((u) => u.id === this.id)
        )?.[0] ?? '',
    }))
  }

  /** Fetch persisted messages + reactions from the DB for a non-temporary room. */
  private async loadPersistentMessages(roomId: string): Promise<object[]> {
    const msgs = await db
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

    const allReactions = await db
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
      const msgReactions = allReactions.filter((r: ReactionRow) => r.messageId === msg.id)

      const reactionMap = msgReactions.reduce(
        (acc: Record<string, { id: string; name: string; avatar: string }[]>, r: ReactionRow) => {
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
          (r: ReactionRow) =>
            (r.userId ?? r.pTempUserId) === this.id && r.emoji
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

  /**
   * Get the current reaction state for a message.
   * For temporary rooms reads from in-memory; for persistent rooms hits the DB.
   */
  private async getReactionsForMessage(
    messageId: string
  ): Promise<Record<string, { id: string; name: string; avatar: string }[]>> {
    const isTemporary = RoomManager.getInstance().rooms.get(this.roomId)?.isTemporary

    if (isTemporary) {
      const room = RoomManager.getInstance().rooms.get(this.roomId)
      return room?.lastMessages.find((m) => m.id === messageId)?.reactions ?? {}
    }

    const rows = await db
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
      (acc: Record<string, { id: string; name: string; avatar: string }[]>, r: ReactionRow) => {
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

  private sendError(message: string): void {
    this.send({ type: 'error', payload: { message } })
  }
}

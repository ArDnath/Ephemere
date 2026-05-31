import { db } from '@ephemere/db'
import { roomParticipants } from '@ephemere/db/schema'
import { and, eq } from 'drizzle-orm'
import type { Room, RoomInfo, TemporaryMessage, WebSocketMessage } from '../types/index.js'
import type { User } from './User.js'

/**
 * Singleton that owns the in-memory map of live rooms.
 *
 * Each room entry tracks the connected User instances and, for temporary
 * rooms, an in-memory message log.  For persistent rooms every message and
 * reaction is written straight to the database and read back on join.
 */
export class RoomManager {
  public readonly rooms: Map<string, Room> = new Map()
  private static instance: RoomManager

  private constructor() {}

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager()
    }
    return RoomManager.instance
  }

  // ─── User lifecycle ────────────────────────────────────────────────────────

  /**
   * Add a user to a room.
   * - Creates the room slot if it doesn't exist yet.
   * - Enforces maxUsers.
   * - Upserts the DB participant row (except for the special "public" room).
   * - Stores the generated participant ID on the User instance so that
   *   message / reaction inserts can reference it directly.
   *
   * Returns `false` when the room is already at capacity.
   */
  public async addUser(user: User, roomInfo: RoomInfo): Promise<boolean> {
    if (!this.rooms.has(roomInfo.id)) {
      this.rooms.set(roomInfo.id, {
        users: [],
        isTemporary: roomInfo.isTemporary,
        lastMessages: [],
        maxTimeLimit: roomInfo.maxTimeLimit,
        maxUsers: roomInfo.maxUsers,
      })
    }

    const room = this.rooms.get(roomInfo.id)!

    if (room.users.length >= room.maxUsers) {
      return false
    }

    // Persist / refresh the participant record in the database
    if (roomInfo.id !== 'public') {
      const whereClause = user.temporary
        ? and(
            eq(roomParticipants.roomId, roomInfo.id),
            eq(roomParticipants.tempUserId, user.id)
          )
        : and(
            eq(roomParticipants.roomId, roomInfo.id),
            eq(roomParticipants.userId, user.id)
          )

      const [existing] = await db
        .select()
        .from(roomParticipants)
        .where(whereClause!)
        .limit(1)

      if (existing) {
        // Re-joining an existing session — clear leftAt, refresh joinedAt
        await db
          .update(roomParticipants)
          .set({ leftAt: null, joinedAt: new Date() })
          .where(eq(roomParticipants.id, existing.id))
        user.participantId = existing.id
      } else {
        const [inserted] = await db
          .insert(roomParticipants)
          .values({
            roomId: roomInfo.id,
            ...(user.temporary
              ? {
                  tempUserId: user.id,
                  tempUsername: user.name,
                  tempUserImage: user.avatar,
                }
              : { userId: user.id }),
          })
          .returning()
        user.participantId = inserted!.id
      }
    }

    room.users.push(user)
    return true
  }

  /**
   * Remove a user from the in-memory room and stamp their `leftAt` in the DB.
   * Cleans up the room slot when the last user leaves.
   */
  public async removeUser(roomId: string, user: User): Promise<void> {
    const room = this.rooms.get(roomId)
    if (!room) return

    room.users = room.users.filter((u) => u.id !== user.id)

    if (roomId !== 'public') {
      const whereClause = user.temporary
        ? and(
            eq(roomParticipants.roomId, roomId),
            eq(roomParticipants.tempUserId, user.id)
          )
        : and(
            eq(roomParticipants.roomId, roomId),
            eq(roomParticipants.userId, user.id)
          )

      await db
        .update(roomParticipants)
        .set({ leftAt: new Date() })
        .where(whereClause!)
        .catch((err: Error) =>
          console.error('[RoomManager] Failed to stamp leftAt:', err)
        )
    }

    if (room.users.length === 0 && roomId !== 'public') {
      this.rooms.delete(roomId)
    }
  }

  // ─── Broadcasting helpers ──────────────────────────────────────────────────

  /** Send to everyone in the room EXCEPT the sender */
  public broadcast(data: WebSocketMessage, sender: User, roomId: string): void {
    const room = this.rooms.get(roomId)
    if (!room) return
    room.users.forEach((u) => {
      if (u.id !== sender.id) u.send(data)
    })
  }

  /** Send to every connected user in the room (including the sender) */
  public broadcastToAll(data: WebSocketMessage, roomId: string): void {
    const room = this.rooms.get(roomId)
    if (!room) return
    room.users.forEach((u) => u.send(data))
  }

  // ─── Temporary-room message log ───────────────────────────────────────────

  public addTemporaryMessage(roomId: string, message: TemporaryMessage): void {
    const room = this.rooms.get(roomId)
    if (room?.isTemporary) {
      room.lastMessages.push(message)
    }
  }

  /**
   * Mutate a reaction in the in-memory message log (temporary rooms only).
   * Uses the emoji as the map key; de-duplicates by user ID.
   */
  public updateTemporaryMessageReaction(
    roomId: string,
    messageId: string,
    emoji: string,
    reactionUser: { id: string; name: string; avatar: string },
    action: 'add' | 'remove'
  ): void {
    const room = this.rooms.get(roomId)
    if (!room) return
    const msg = room.lastMessages.find((m) => m.id === messageId)
    if (!msg) return

    if (!msg.reactions[emoji]) msg.reactions[emoji] = []

    if (action === 'add') {
      const already = msg.reactions[emoji]!.some((u) => u.id === reactionUser.id)
      if (!already) msg.reactions[emoji]!.push(reactionUser)
    } else {
      msg.reactions[emoji] = msg.reactions[emoji]!.filter(
        (u) => u.id !== reactionUser.id
      )
      if (msg.reactions[emoji]!.length === 0) {
        delete msg.reactions[emoji]
      }
    }
  }
}

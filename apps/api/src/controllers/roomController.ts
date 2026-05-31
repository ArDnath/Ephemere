import { Context } from 'hono'
import { db } from '@ephemere/db'
import {
  users,
  rooms,
  roomParticipants,
  messages,
  reactions,
  subscriptions,
  plans,
} from '@ephemere/db/schema'
import { eq, lt, gte, and, ilike, or, desc, asc } from 'drizzle-orm'
import { createRoomSchema } from '@ephemere/lib'
import { r2Client } from '@/utils/StorageClient'
import getKeyFromUrl from '@/utils/getKeyFromUrl'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import type { JWTPayload } from '@/types/index'

export const createRoom = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = createRoomSchema.safeParse(body)
    if (!result.success) {
      return c.json({ message: 'Invalid request body' }, 400)
    }

    const { name, isTemporary, maxTimeLimit, maxUsers } = result.data
    const authUser = c.get('user') as JWTPayload

    // Fetch user with subscription/plan data
    const [user] = await db
      .select({
        id: users.id,
        roomsCount: users.roomsCount,
        savedRoomsCount: users.savedRoomsCount,
        maxTimeLimit: plans.maxTimeLimit,
        maxUsers: plans.maxUsers,
        maxRooms: plans.maxRooms,
        maxSavedRooms: plans.maxSavedRooms,
        hasSub: subscriptions.id,
      })
      .from(users)
      .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
      .leftJoin(plans, eq(plans.id, subscriptions.planId))
      .where(eq(users.id, authUser.userId))
      .limit(1)

    if (!user) {
      return c.json({ message: 'User not found' }, 404)
    }

    if (!user.hasSub) {
      return c.json({ message: 'No active subscription' }, 403)
    }

    if (maxTimeLimit > (user.maxTimeLimit ?? 0)) {
      return c.json({ message: 'Time limit exceeds plan maximum' }, 403)
    }

    if (maxUsers > (user.maxUsers ?? 0)) {
      return c.json({ message: 'User limit exceeds plan maximum' }, 403)
    }

    if (isTemporary && user.roomsCount >= (user.maxRooms ?? 0)) {
      return c.json({ message: 'Room limit reached for your plan' }, 403)
    }

    if (!isTemporary && user.savedRoomsCount >= (user.maxSavedRooms ?? 0)) {
      return c.json({ message: 'Saved room limit reached for your plan' }, 403)
    }

    const [room] = await db
      .insert(rooms)
      .values({
        name,
        isTemporary,
        maxTimeLimit,
        maxUsers,
        createdById: user.id,
        closedAt: new Date(Date.now() + maxTimeLimit * 60 * 1000),
      })
      .returning()

    await db
      .update(users)
      .set({
        roomsCount: user.roomsCount + 1,
        savedRoomsCount: isTemporary
          ? user.savedRoomsCount
          : user.savedRoomsCount + 1,
      })
      .where(eq(users.id, user.id))

    return c.json(room, 201)
  } catch (error) {
    console.error('Error creating room:', error)
    return c.json({ message: 'Failed to create room' }, 400)
  }
}

export const getRoomsHistory = async (c: Context) => {
  try {
    const authUser = c.get('user') as JWTPayload

    const userRooms = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        isTemporary: rooms.isTemporary,
        maxTimeLimit: rooms.maxTimeLimit,
        maxUsers: rooms.maxUsers,
        createdById: rooms.createdById,
        createdAt: rooms.createdAt,
        closedAt: rooms.closedAt,
        updatedAt: rooms.updatedAt,
      })
      .from(rooms)
      .where(
        and(
          eq(rooms.createdById, authUser.userId),
          lt(rooms.closedAt, new Date())
        )
      )
      .orderBy(desc(rooms.closedAt))

    // Fetch participants for each room
    const roomIds = userRooms.map((r) => r.id)
    const allParticipants = roomIds.length
      ? await db
          .select({
            id: roomParticipants.id,
            roomId: roomParticipants.roomId,
            tempUsername: roomParticipants.tempUsername,
            tempUserId: roomParticipants.tempUserId,
            joinedAt: roomParticipants.joinedAt,
            leftAt: roomParticipants.leftAt,
            userId: users.id,
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
          })
          .from(roomParticipants)
          .leftJoin(users, eq(roomParticipants.userId, users.id))
          .where(
            roomIds.length === 1
              ? eq(roomParticipants.roomId, roomIds[0]!)
              : or(...roomIds.map((id) => eq(roomParticipants.roomId, id)))
          )
      : []

    // Count messages per room
    const allMessages = roomIds.length
      ? await db
          .select({ roomId: messages.roomId, id: messages.id })
          .from(messages)
          .where(
            roomIds.length === 1
              ? eq(messages.roomId, roomIds[0]!)
              : or(...roomIds.map((id) => eq(messages.roomId, id)))
          )
      : []

    const result = userRooms.map((room) => {
      const roomParts = allParticipants.filter((p) => p.roomId === room.id)
      const msgCount = allMessages.filter((m) => m.roomId === room.id).length
      return {
        ...room,
        _count: { messages: msgCount },
        participants: roomParts.map((p) => ({
          id: p.id,
          tempUsername: p.tempUsername,
          tempUserId: p.tempUserId,
          joinedAt: p.joinedAt,
          leftAt: p.leftAt,
          user: p.userId
            ? { id: p.userId, name: p.userName, email: p.userEmail, image: p.userImage }
            : null,
        })),
      }
    })

    return c.json(result)
  } catch (error) {
    console.error('Error fetching rooms history:', error)
    return c.json({ message: 'Failed to fetch rooms history' }, 400)
  }
}

export const getRoomHistory = async (c: Context) => {
  try {
    const roomId = c.req.param('roomId')
    const authUser = c.get('user') as JWTPayload

    if (!roomId) {
      return c.json({ message: 'Room ID is required' }, 400)
    }

    const [room] = await db
      .select()
      .from(rooms)
      .where(
        and(eq(rooms.id, roomId), eq(rooms.createdById, authUser.userId))
      )
      .limit(1)

    if (!room) {
      return c.json({ message: 'Room not found' }, 404)
    }

    const msgs = await db
      .select({
        id: messages.id,
        content: messages.content,
        image: messages.image,
        sentAt: messages.sentAt,
        senderId: messages.senderId,
        // participant fields
        pTempUserId: roomParticipants.tempUserId,
        pTempUsername: roomParticipants.tempUsername,
        pTempUserImage: roomParticipants.tempUserImage,
        // user fields
        userId: users.id,
        userName: users.name,
        userImage: users.image,
      })
      .from(messages)
      .innerJoin(roomParticipants, eq(messages.senderId, roomParticipants.id))
      .leftJoin(users, eq(roomParticipants.userId, users.id))
      .where(eq(messages.roomId, roomId!))
      .orderBy(asc(messages.sentAt))

    // Fetch reactions for all messages
    const msgIds = msgs.map((m) => m.id)
    const allReactions = msgIds.length
      ? await db
          .select({
            messageId: reactions.messageId,
            emoji: reactions.emoji,
            senderId: reactions.senderId,
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
              : or(...msgIds.map((id) => eq(reactions.messageId, id)))
          )
      : []

    const formattedMsgs = msgs.map((msg) => {
      const msgReactions = allReactions.filter((r) => r.messageId === msg.id)

      const reactionMap = msgReactions.reduce(
        (acc, r) => {
          const reactionUser = {
            id: r.userId ?? r.pTempUserId ?? '',
            name: r.userName ?? r.pTempUsername ?? '',
            avatar: r.userImage ?? r.pTempUserImage ?? '',
          }
          if (!acc[r.emoji]) acc[r.emoji] = []
          acc[r.emoji]!.push(reactionUser)
          return acc
        },
        {} as Record<string, { id: string; name: string; avatar: string }[]>
      )

      return {
        id: msg.id,
        content: msg.content,
        ...(msg.image && { image: msg.image }),
        userId: msg.userId ?? msg.pTempUserId ?? '',
        username: msg.userName ?? msg.pTempUsername ?? '',
        avatar: msg.userImage ?? msg.pTempUserImage ?? '',
        sentAt: msg.sentAt,
        reactions: reactionMap,
      }
    })

    return c.json(formattedMsgs)
  } catch (error) {
    console.error('Error fetching room history:', error)
    return c.json({ message: 'Failed to fetch room history' }, 400)
  }
}

export const getUserRooms = async (c: Context) => {
  try {
    const authUser = c.get('user') as JWTPayload
    const search = c.req.query('search')
    const now = new Date()

    // Rooms created by this user that are still open
    const createdRooms = await db
      .select()
      .from(rooms)
      .where(
        and(
          eq(rooms.createdById, authUser.userId),
          gte(rooms.closedAt, now),
          search ? ilike(rooms.name, `%${search}%`) : undefined
        )
      )
      .orderBy(desc(rooms.updatedAt))

    // Rooms the user participates in (not created by them)
    const participantRooms = await db
      .select({ room: rooms })
      .from(roomParticipants)
      .innerJoin(rooms, eq(roomParticipants.roomId, rooms.id))
      .where(
        and(
          eq(roomParticipants.userId, authUser.userId),
          gte(rooms.closedAt, now),
          search ? ilike(rooms.name, `%${search}%`) : undefined
        )
      )
      .orderBy(desc(rooms.updatedAt))

    // Collect all unique room IDs
    const allRoomIds = [
      ...createdRooms.map((r) => r.id),
      ...participantRooms.map((p) => p.room.id),
    ]
    const uniqueRoomIds = [...new Set(allRoomIds)]

    if (uniqueRoomIds.length === 0) {
      return c.json({})
    }

    // Fetch participants for all rooms at once
    const allParticipants = await db
      .select({
        id: roomParticipants.id,
        roomId: roomParticipants.roomId,
        tempUsername: roomParticipants.tempUsername,
        tempUserId: roomParticipants.tempUserId,
        joinedAt: roomParticipants.joinedAt,
        leftAt: roomParticipants.leftAt,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        userImage: users.image,
      })
      .from(roomParticipants)
      .leftJoin(users, eq(roomParticipants.userId, users.id))
      .where(
        uniqueRoomIds.length === 1
          ? eq(roomParticipants.roomId, uniqueRoomIds[0]!)
          : or(...uniqueRoomIds.map((id) => eq(roomParticipants.roomId, id)))
      )

    // Count messages per room
    const allMessages = await db
      .select({ roomId: messages.roomId, id: messages.id })
      .from(messages)
      .where(
        uniqueRoomIds.length === 1
          ? eq(messages.roomId, uniqueRoomIds[0]!)
          : or(...uniqueRoomIds.map((id) => eq(messages.roomId, id)))
      )

    const buildRoomEntry = (room: typeof rooms.$inferSelect) => ({
      ...room,
      _count: { messages: allMessages.filter((m) => m.roomId === room.id).length },
      participants: allParticipants
        .filter((p) => p.roomId === room.id)
        .map((p) => ({
          id: p.id,
          tempUsername: p.tempUsername,
          tempUserId: p.tempUserId,
          joinedAt: p.joinedAt,
          leftAt: p.leftAt,
          user: p.userId
            ? { id: p.userId, name: p.userName, email: p.userEmail, image: p.userImage }
            : null,
        })),
    })

    const roomMap = new Map<string, ReturnType<typeof buildRoomEntry>>()

    for (const room of createdRooms) {
      roomMap.set(room.id, buildRoomEntry(room))
    }
    for (const { room } of participantRooms) {
      if (!roomMap.has(room.id)) {
        roomMap.set(room.id, buildRoomEntry(room))
      }
    }

    return c.json(Object.fromEntries(roomMap))
  } catch (error) {
    console.error('Error fetching user rooms:', error)
    return c.json({ message: 'Failed to fetch user rooms' }, 500)
  }
}

export const removeRoom = async (c: Context) => {
  try {
    const roomId = c.req.param('roomId')
    const authUser = c.get('user') as JWTPayload
    const userId = authUser?.userId

    if (!userId) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    if (!roomId) {
      return c.json({ message: 'Room ID is required' }, 400)
    }

    const [room] = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.id, roomId), eq(rooms.createdById, userId)))
      .limit(1)

    if (!room) {
      return c.json({ message: 'Room not found or unauthorized to delete' }, 404)
    }

    // Delete S3 images for non-temporary rooms
    if (!room.isTemporary) {
      const roomMessages = await db
        .select({ image: messages.image })
        .from(messages)
        .where(eq(messages.roomId, roomId!))

      for (const msg of roomMessages) {
        if (msg.image) {
          try {
            await r2Client.send(
              new DeleteObjectCommand({
                Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME ?? '',
                Key: getKeyFromUrl(msg.image),
              })
            )
          } catch (err) {
            console.error('Error deleting image from R2:', err)
          }
        }
      }
    }

    await db.delete(rooms).where(eq(rooms.id, roomId!))

    return c.json({ message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Error removing room:', error)
    return c.json({ message: 'Failed to remove room' }, 500)
  }
}

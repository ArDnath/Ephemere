import { Context } from 'hono'
import { db } from '@ephemere/db'
import { users } from '@ephemere/db/schema'
import { eq } from 'drizzle-orm'
import { updateProfileSchema } from '@ephemere/lib'
import type { JWTPayload } from '@/types/index'

export const getStats = async (c: Context) => {
  try {
    const user = c.get('user') as JWTPayload
    const [stats] = await db
      .select({
        savedRoomsCount: users.savedRoomsCount,
        roomsCount: users.roomsCount,
      })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1)

    if (!stats) {
      return c.json({ message: 'User stats not found' }, 404)
    }

    return c.json({
      totalRooms: stats.roomsCount,
      savedRooms: stats.savedRoomsCount,
      temporaryRooms: stats.roomsCount - stats.savedRoomsCount,
    })
  } catch {
    return c.json({ message: 'Failed to fetch user stats' }, 500)
  }
}

export const updateProfile = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = updateProfileSchema.safeParse(body)

    if (!result.success) {
      return c.json(
        { message: 'Invalid input', errors: result.error.errors },
        400
      )
    }

    const { name, image } = result.data
    const user = c.get('user') as JWTPayload

    const updateData: { name?: string; image?: string } = {}
    if (name) updateData.name = name
    if (image) updateData.image = image

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.userId))
      .returning({ id: users.id, name: users.name, image: users.image })

    return c.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return c.json({ message: 'Failed to update profile' }, 500)
  }
}

export const deleteAccount = async (c: Context) => {
  try {
    const user = c.get('user') as JWTPayload
    await db.delete(users).where(eq(users.id, user.userId))
    return c.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return c.json({ message: 'Failed to delete account' }, 500)
  }
}

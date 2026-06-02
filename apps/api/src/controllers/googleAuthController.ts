import { Context } from 'hono'
import { z } from 'zod'
import { signToken } from '@/utils/jwt'
import { db } from '@ephemere/db'
import { users } from '@ephemere/db/schema'
import { eq } from 'drizzle-orm'
import { googleAuthSchema } from '@ephemere/lib'
import { getGoogleOAuthTokens } from '@/utils/getGoogleOAuthToken'

export const googleAuth = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = googleAuthSchema.safeParse(body)
    if (!result.success) {
      return c.json({ errors: result.error.flatten().fieldErrors }, 400)
    }

    const code = result.data.access_token

    try {
      const tokens = await getGoogleOAuthTokens(code)

      const res = await fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
      )
      const userInfo = await res.json()

      const userDataSchema = z.object({
        email: z.string().email(),
        name: z.string(),
        picture: z.string().url().optional(),
      })

      const parsedUserData = userDataSchema.safeParse(userInfo)
      if (!parsedUserData.success) {
        return c.json({ message: 'Invalid user data from Google' }, 400)
      }

      const { email, name, picture } = parsedUserData.data

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      if (existingUser) {
        const token = await signToken({ userId: existingUser.id, email: existingUser.email, isPro: false })
        return c.json({ token, user: existingUser, isNewUser: false })
      }

      const [newUser] = await db
        .insert(users)
        .values({
          email,
          name,
          image: picture ?? `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100) + 1}`,
          provider: 'GOOGLE',
        })
        .returning()

      const token = await signToken({ userId: newUser!.id, email: newUser!.email, isPro: false })
      return c.json({ token, user: newUser, isNewUser: true }, 201)
    } catch (tokenError) {
      console.error('Failed to exchange Google auth code for tokens:', tokenError)
      return c.json({ message: 'Failed to authenticate with Google' }, 400)
    }
  } catch (error) {
    console.error('Google auth error:', error)
    return c.json({ message: 'Authentication failed' }, 500)
  }
}

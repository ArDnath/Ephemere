import { Context } from 'hono'
import { z } from 'zod'
import { signToken } from '@/utils/jwt'
import { db } from '@ephemere/db'
import { users } from '@ephemere/db/schema'
import { eq } from 'drizzle-orm'
import { githubAuthSchema } from '@ephemere/lib'

export const githubAuth = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = githubAuthSchema.safeParse(body)
    if (!result.success) {
      return c.json({ errors: result.error.flatten().fieldErrors }, 400)
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.JWT_SECRET) {
      console.error('Missing required environment variables for GitHub auth')
      return c.json({ message: 'Server configuration error' }, 500)
    }

    const { code } = result.data

    // Exchange code for access token
    let access_token: string
    try {
      const tokenRes = await fetch(
        `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`,
        { method: 'POST', headers: { Accept: 'application/json' } }
      )
      const tokenData = await tokenRes.json() as { access_token?: string }
      if (!tokenData.access_token) {
        return c.json({ message: 'GitHub did not provide an access token' }, 400)
      }
      access_token = tokenData.access_token
    } catch (error) {
      console.error('Failed to exchange GitHub code for token:', error)
      return c.json({ message: 'Failed to authenticate with GitHub' }, 400)
    }

    // Fetch user profile
    let userInfo: { name: string | null; avatar_url: string; login: string }
    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      const userDataSchema = z.object({
        name: z.string().nullable(),
        avatar_url: z.string().url(),
        login: z.string(),
      })
      const parsed = userDataSchema.safeParse(await userRes.json())
      if (!parsed.success) {
        return c.json({ message: 'Invalid user data from GitHub' }, 400)
      }
      userInfo = parsed.data
    } catch (error) {
      console.error('Failed to fetch GitHub user data:', error)
      return c.json({ message: 'Failed to fetch user data from GitHub' }, 400)
    }

    // Fetch user emails
    let email: string
    try {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${access_token}` },
      })
      const emails = await emailRes.json() as Array<{ email: string; primary: boolean }>
      if (!emails || emails.length === 0) {
        return c.json({ message: 'No email found from GitHub' }, 400)
      }
      const sorted = emails.sort((a, b) => Number(b.primary) - Number(a.primary))
      email = sorted[0].email
    } catch (error) {
      console.error('Failed to fetch user emails from GitHub:', error)
      return c.json({ message: 'Failed to fetch user emails from GitHub' }, 400)
    }

    const { name, avatar_url, login } = userInfo

    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (existingUser) {
      const token = await signToken({ userId: existingUser.id, email: existingUser.email, isPro: false })
      return c.json({ token, user: existingUser, isNewUser: false })
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: name ?? login,
        image: avatar_url ?? `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100) + 1}`,
        provider: 'GITHUB',
      })
      .returning()

    const token = await signToken({ userId: newUser!.id, email: newUser!.email, isPro: false })
    return c.json({ token, user: newUser, isNewUser: true }, 201)
  } catch (error) {
    console.error('GitHub auth error:', error)
    return c.json({ message: 'Authentication failed' }, 500)
  }
}

import { Context } from 'hono'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { db } from '@ephemere/db'
import { users } from '@ephemere/db/schema'
import { eq } from 'drizzle-orm'
import axios from 'axios'
import { githubAuthSchema } from '@ephemere/lib'

export const githubAuth = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = githubAuthSchema.safeParse(body)
    if (!result.success) {
      return c.json({ errors: result.error.flatten().fieldErrors }, 400)
    }

    if (
      !process.env.GITHUB_CLIENT_ID ||
      !process.env.GITHUB_CLIENT_SECRET ||
      !process.env.JWT_SECRET
    ) {
      console.error('Missing required environment variables for GitHub auth')
      return c.json({ message: 'Server configuration error' }, 500)
    }

    const { code } = result.data

    let tokenResponse
    try {
      tokenResponse = await axios.post(
        `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`,
        null,
        { headers: { Accept: 'application/json' } }
      )
    } catch (error) {
      console.error('Failed to exchange GitHub code for token:', error)
      return c.json({ message: 'Failed to authenticate with GitHub' }, 400)
    }

    const { access_token } = tokenResponse.data
    if (!access_token) {
      return c.json({ message: 'GitHub did not provide an access token' }, 400)
    }

    let userInfoResponse
    try {
      userInfoResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      })
    } catch (error) {
      console.error('Failed to fetch GitHub user data:', error)
      return c.json({ message: 'Failed to fetch user data from GitHub' }, 400)
    }

    const userDataSchema = z.object({
      name: z.string().nullable(),
      avatar_url: z.string().url(),
      login: z.string(),
    })

    const parsedUserData = userDataSchema.safeParse(userInfoResponse.data)
    if (!parsedUserData.success) {
      return c.json({ message: 'Invalid user data from GitHub' }, 400)
    }

    const { name, avatar_url, login } = parsedUserData.data

    let emails
    try {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${access_token}` },
      })
      emails = emailResponse.data
    } catch (error) {
      console.error('Failed to fetch user emails from GitHub:', error)
      return c.json({ message: 'Failed to fetch user emails from GitHub' }, 400)
    }

    if (!emails || emails.length === 0) {
      return c.json({ message: 'No email found from GitHub' }, 400)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortedEmails = emails.sort((a: any, b: any) => b.primary - a.primary)
    const email = sortedEmails[0].email

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      const token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email, isPro: false },
        process.env.JWT_SECRET as string
      )
      return c.json({ token, user: existingUser, isNewUser: false })
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: name ?? login,
        image:
          avatar_url ??
          `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100) + 1}`,
        provider: 'GITHUB',
      })
      .returning()

    const token = jwt.sign(
      { userId: newUser!.id, email: newUser!.email, isPro: false },
      process.env.JWT_SECRET as string
    )
    return c.json({ token, user: newUser, isNewUser: true }, 201)
  } catch (error) {
    console.error('GitHub auth error:', error)
    return c.json({ message: 'Authentication failed' }, 500)
  }
}

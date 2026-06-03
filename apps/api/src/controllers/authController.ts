import { Context } from 'hono'
import {
  signupSchema,
  emailVerifySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@ephemere/lib'
import { db } from '@ephemere/db'
import {
  users,
  emailVerificationTokens,
  passwordResetTokens,
} from '@ephemere/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { generateOTP } from '@/utils/generateOTP'
import { sendMail } from '@/utils/sendMail'
import { comparePassword, hashPassword } from '@/utils/hashPassword'
import { signToken } from '@/utils/jwt'
import type { JWTPayload } from '@/types/index'

export const callback = async (c: Context) => {
  try {
    const token = 'dummy_token'
    return c.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`)
  } catch {
    return c.redirect(`${process.env.FRONTEND_URL}/auth/error`)
  }
}

export const logout = async (c: Context) => {
  return c.json({ message: 'Logged out successfully' })
}

export const sendVerificationOtp = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = emailVerifySchema.safeParse(body)
    if (!result.success) {
      return c.json({ errors: result.error.flatten().fieldErrors }, 400)
    }
    const { email } = result.data

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      return c.json({ message: 'User already exists with this email' }, 400)
    }

    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.identifier, email))

    const code = generateOTP()
    await db.insert(emailVerificationTokens).values({
      identifier: email,
      token: code,
      expires: new Date(Date.now() + 2 * 60 * 1000),
    })

    await sendMail({
      subject: 'Ephemere Chat: OTP to verify your account',
      email,
      message: `Your verification code is: ${code}`,
      tag: 'verify-email',
    })

    return c.json({ message: 'Verification OTP sent successfully', success: true })
  } catch {
    return c.json({ message: 'Failed to send verification OTP' }, 500)
  }
}

export const loginWithCredentials = async (
  email: string,
  password: string
): Promise<{
  success: boolean
  token?: string
  user?: { id: string; email: string }
  message?: string
}> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) return { success: false, message: 'User not found' }
  if (!user.password) return { success: false, message: 'Invalid login method' }

  const isValidPassword = await comparePassword(password, user.password)
  if (!isValidPassword) return { success: false, message: 'Invalid password' }

  const payload: JWTPayload = { userId: user.id, email: user.email, isPro: false }
  const token = await signToken(payload)

  return { success: true, token, user: { id: user.id, email: user.email } }
}

export const createAccount = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      return c.json({ message: 'Invalid input' }, 400)
    }

    const { email, password, firstName, lastName, code } = result.data

    const [verificationToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.identifier, email),
          eq(emailVerificationTokens.token, code),
          gte(emailVerificationTokens.expires, new Date())
        )
      )
      .limit(1)

    if (!verificationToken) {
      return c.json({ message: 'Invalid verification code entered.' }, 400)
    }

    await db
      .delete(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.identifier, email),
          eq(emailVerificationTokens.token, code)
        )
      )

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!existingUser) {
      const randomNum = Math.floor(Math.random() * 100) + 1
      await db.insert(users).values({
        email,
        password: await hashPassword(password),
        name: `${firstName} ${lastName}`,
        image: `https://avatar.iran.liara.run/public/${randomNum}`,
      })
    }

    const loginResult = await loginWithCredentials(email, password)
    if (!loginResult.success) {
      return c.json({ message: 'Failed to login after account creation' }, 500)
    }
    return c.json({ token: loginResult.token, user: loginResult.user, success: true }, 201)
  } catch {
    return c.json({ message: 'Failed to create account' }, 500)
  }
}

export const login = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return c.json({ errors: result.error.flatten().fieldErrors }, 400)
    }

    const { email, password } = result.data
    const loginResult = await loginWithCredentials(email, password)

    if (!loginResult.success) {
      return c.json(
        { message: loginResult.message || 'Invalid email or password' },
        401
      )
    }

    return c.json({ token: loginResult.token, user: loginResult.user, success: true })
  } catch {
    return c.json({ message: 'Failed to login' }, 500)
  }
}

export const forgotPassword = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return c.json({ errors: result.error.flatten().fieldErrors }, 400)
    }
    const { email } = result.data

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      return c.json({ message: 'No user found with this email' }, 400)
    }

    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.identifier, email))

    const code = generateOTP()
    await db.insert(passwordResetTokens).values({
      identifier: email,
      token: code,
      expires: new Date(Date.now() + 2 * 60 * 1000),
    })

    await sendMail({
      subject: 'Ephemere Chat: Reset your password',
      email,
      message: code,
      tag: 'password_reset',
    })

    return c.json({ message: 'Password reset code sent successfully', success: true })
  } catch {
    return c.json({ message: 'Failed to process forgot password request' }, 500)
  }
}

export const resetPassword = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      return c.json({ errors: result.error.flatten().fieldErrors }, 400)
    }
    const { email, password, code } = result.data

    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.identifier, email),
          eq(passwordResetTokens.token, code),
          gte(passwordResetTokens.expires, new Date())
        )
      )
      .limit(1)

    if (!resetToken) {
      return c.json({ message: 'Invalid or expired reset code' }, 400)
    }

    await db
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.identifier, email),
          eq(passwordResetTokens.token, code)
        )
      )

    await db
      .update(users)
      .set({ password: await hashPassword(password) })
      .where(eq(users.email, email))

    return c.json({ message: 'Password reset successful', success: true })
  } catch {
    return c.json({ message: 'Failed to reset password' }, 500)
  }
}

export const getSession = async (c: Context) => {
  try {
    const user = c.get('user') as JWTPayload | undefined
    if (!user) {
      return c.json({ message: 'Not authenticated' }, 401)
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
      with: {
        subscription: true,
      },
    })

    if (!dbUser) {
      return c.json({ message: 'User not found' }, 404)
    }

    // Exclude password for security
    const { password, ...safeUser } = dbUser

    return c.json({ user: safeUser })
  } catch (error) {
    console.error('Failed to get session:', error)
    return c.json({ message: 'Failed to get session' }, 500)
  }
}

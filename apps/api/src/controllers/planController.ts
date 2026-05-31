import { Context } from 'hono'
import { db } from '@ephemere/db'
import { users, subscriptions } from '@ephemere/db/schema'
import { eq } from 'drizzle-orm'
import { sendMail } from '@/utils/sendMail'
import type { JWTPayload } from '@/types/index'

export const activateFreePlan = async (c: Context) => {
  try {
    const user = c.get('user') as JWTPayload
    const userId = user?.userId

    if (!userId) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const [existingSubscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)

    if (existingSubscription) {
      return c.json({ message: 'User already has an active subscription' }, 400)
    }

    const [dbUser] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!dbUser) {
      return c.json({ message: 'User not found' }, 404)
    }

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        isMonthly: false,
        planId: 'free282003',
        userId,
        autoRenew: false,
      })
      .returning()

    await db
      .update(users)
      .set({ subscriptionId: subscription!.id })
      .where(eq(users.id, userId))

    await sendMail({
      subject: 'Welcome to Echo Chat Free Trial',
      email: dbUser.email,
      message: '',
      tag: 'free_trial_active',
      username: dbUser.name,
      dashboardLink: `${process.env.FRONTEND_URL}/dashboard`,
    })

    return c.json({ message: 'Free plan activated successfully' })
  } catch (error) {
    console.error('Error activating free plan:', error)
    return c.json({ message: 'Failed to activate free plan' }, 500)
  }
}

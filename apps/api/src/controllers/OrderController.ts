import { Context } from 'hono'
import { db } from '@ephemere/db'
import { plans, purchases, subscriptions, users } from '@ephemere/db/schema'
import { eq } from 'drizzle-orm'
import razorpay from '@/utils/Razorpay'
import { sendMail } from '@/utils/sendMail'
import axios from 'axios'
import { createOrderSchema, verifyPaymentSchema } from '@ephemere/lib'
import type { JWTPayload } from '@/types/index'

export const createOrder = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = createOrderSchema.safeParse(body)
    if (!result.success) {
      return c.json({ errors: result.error.errors }, 400)
    }

    const { planId, isMonthly, currency } = result.data
    const user = c.get('user') as JWTPayload
    const userId = user?.userId

    if (!userId) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1)

    if (!plan) {
      return c.json({ message: 'Plan not found' }, 404)
    }

    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`)
    const rates = response.data.rates as Record<string, number>

    if (!rates[currency]) {
      return c.json({ message: 'Invalid currency' }, 400)
    }

    const baseAmount = isMonthly ? plan.price : plan.price * 12 * 0.8
    const amount = baseAmount * rates[currency]!

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `order_${Date.now()}`,
    })

    const [purchase] = await db
      .insert(purchases)
      .values({
        razorpayOrderId: order.id,
        amount,
        currency,
        userId,
        planId,
      })
      .returning()

    return c.json({
      orderId: order.id,
      amount,
      currency,
      purchaseId: purchase!.id,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return c.json({ message: 'Failed to create order' }, 500)
  }
}

export const verifyPayment = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = verifyPaymentSchema.safeParse(body)
    if (!result.success) {
      return c.json({ errors: result.error.errors }, 400)
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = result.data
    const user = c.get('user') as JWTPayload
    const userId = user?.userId

    if (!userId) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const [purchase] = await db
      .select({
        id: purchases.id,
        amount: purchases.amount,
        currency: purchases.currency,
        planId: purchases.planId,
        userEmail: users.email,
        userName: users.name,
      })
      .from(purchases)
      .innerJoin(users, eq(purchases.userId, users.id))
      .where(eq(purchases.razorpayOrderId, razorpay_order_id))
      .limit(1)

    if (!purchase) {
      return c.json({ message: 'Purchase not found' }, 404)
    }

    await db
      .update(purchases)
      .set({
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'completed',
      })
      .where(eq(purchases.id, purchase.id))

    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`)
    const rates = response.data.rates as Record<string, number>

    const amountInUSD = purchase.amount / (rates[purchase.currency] ?? 1)
    const isMonthly = amountInUSD <= 100

    const endDate = new Date(
      Date.now() + (isMonthly ? 30 : 365) * 24 * 60 * 60 * 1000
    )

    // Check if subscription exists
    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)

    let subscription
    if (existingSub) {
      const [updated] = await db
        .update(subscriptions)
        .set({ planId: purchase.planId, isPro: true, isMonthly, endDate })
        .where(eq(subscriptions.userId, userId))
        .returning()
      subscription = updated
    } else {
      const [created] = await db
        .insert(subscriptions)
        .values({ userId, planId: purchase.planId, isPro: true, isMonthly, endDate })
        .returning()
      subscription = created
    }

    await db
      .update(users)
      .set({ subscriptionId: subscription!.id })
      .where(eq(users.id, userId))

    await sendMail({
      subject: 'Payment Successful - Ephemere Chat Pro Activated',
      email: purchase.userEmail,
      message: '',
      tag: 'subscription_active',
      username: purchase.userName,
      dashboardLink: `${process.env.FRONTEND_URL}/dashboard`,
    })

    return c.json({ message: 'Payment verified successfully', subscription })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return c.json({ message: 'Failed to verify payment' }, 500)
  }
}

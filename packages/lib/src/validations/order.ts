import { z } from 'zod'

export const createOrderSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  isMonthly: z.boolean(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('INR'),
})

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>

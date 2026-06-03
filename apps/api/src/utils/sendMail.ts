import { Resend } from 'resend'
import { getTemplate } from './getMailTemplate.js'

let resend: Resend | null = null

export type Options = {
  tag:
    | 'verify-email'
    | 'password_reset'
    | 'subscription_active'
    | 'free_trial_active'
  message?: string
  email?: string
  username?: string
  razorpayId?: string
  subject: string
  dateOfActivation?: string
  planId?: string
  planName?: string
  duration?: number
  price?: number
  dashboardLink?: string
}

export const sendMail = async (options: Options) => {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined')
    }

    const from = process.env.RESEND_FROM_EMAIL
    if (!from) {
      throw new Error('RESEND_FROM_EMAIL is not defined')
    }

    resend ??= new Resend(apiKey)

    const result = await resend.emails.send({
      from,
      to: options.email || '',
      subject: options.subject,
      html: getTemplate(options),
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      throw new Error(`Failed to send email: ${result.error.message}`)
    }

    console.log('Email sent successfully:', result.data?.id)
    return result.data
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

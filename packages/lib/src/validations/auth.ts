import { z } from 'zod'

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().min(1, 'Required').email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Must include uppercase, lowercase, number, and special character'
    ),
  code: z.string().length(6, 'OTP must be exactly 6 characters'),
})

export const loginSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Must include uppercase, lowercase, number, and special character'
    ),
  code: z.string().length(6, 'Code must be exactly 6 characters'),
})

export const emailVerifySchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email address'),
})

export const googleAuthSchema = z.object({
  access_token: z.string().min(1, 'Access token is required'),
})

export const githubAuthSchema = z.object({
  code: z.string().min(1, 'Code is required'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type EmailVerifyInput = z.infer<typeof emailVerifySchema>
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>
export type GithubAuthInput = z.infer<typeof githubAuthSchema>

'use client'
import { signupSchema, type SignupInput } from '@ephemere/lib'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import Input from '@/components/shared/Input'
import { useRegisterContext } from '@/context/RegistryContext'
import { SendVerificationOtpAction } from '@/lib/actions/authActions'
import { useAuthStore } from '@/lib/store/auth-store'

import { Button } from '../shared/Button'
import { AuthCardShell } from './auth-card-shell'

const SignupCard = () => {
  const { setStep, setEmail, setPassword, setFirstName, setLastName } =
    useRegisterContext()

  const { isAuthenticating, setIsAuthenticating } = useAuthStore()

  const form = useForm<Omit<SignupInput, 'code'>>({
    resolver: zodResolver(signupSchema.omit({ code: true })),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  const { executeAsync, isExecuting } = useAction(SendVerificationOtpAction, {
    onSuccess: () => {
      setEmail(form.getValues('email'))
      setPassword(form.getValues('password'))
      setFirstName(form.getValues('firstName'))
      setLastName(form.getValues('lastName') ?? '')
      setStep('verify')
      toast.success('Verification email sent successfully')
      setIsAuthenticating(false)
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'An error occurred')
      setIsAuthenticating(false)
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setIsAuthenticating(true)
    try {
      await executeAsync({ email: data.email })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send verification email'

      toast.error(message)
      setIsAuthenticating(false)
    }
  })

  return (
    <AuthCardShell
      title="Create an account"
      description="Please enter your details to sign up."
      footer={
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="transition-ease font-medium text-[hsl(var(--foreground))] underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="First name"
              className="w-1/2 rounded-md px-4 py-2"
              {...form.register('firstName')}
              error={form.formState.errors.firstName?.message}
              required
            />
            <Input
              type="text"
              placeholder="Last name"
              className="w-1/2 rounded-md px-4 py-2"
              {...form.register('lastName')}
              error={form.formState.errors.lastName?.message}
            />
          </div>
          <Input
            type="email"
            placeholder="Email address"
            className="w-full rounded-md px-4 py-2"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
            required
          />
          <Input
            type="password"
            placeholder="Create password"
            className="w-full rounded-md px-4 py-2"
            {...form.register('password')}
            error={form.formState.errors.password?.message}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full rounded-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--foreground)/0.88)]"
          disabled={isAuthenticating}
          isLoading={isExecuting}
        >
          Create account
        </Button>
      </form>
    </AuthCardShell>
  )
}

export default SignupCard

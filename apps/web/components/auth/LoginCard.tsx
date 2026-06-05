'use client'
import { loginSchema, type LoginInput } from '@ephemere/lib'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { AuthHeader } from '@/components/auth/auth-header'
import Input from '@/components/shared/Input'
import { LoadingSvgScreen } from '@/components/ui/LoadingSvgScreen'
import { LoginAction } from '@/lib/actions/authActions'
import { useAuthStore } from '@/lib/store/auth-store'

import { Button } from '../shared/Button'

import AuthProviderButtons from './AuthProviderButtons'

interface LoginCardProps {
  error?: string
}

const LoginCard = ({ error }: LoginCardProps) => {
  const router = useRouter()

  const { isAuthenticating, setIsAuthenticating } = useAuthStore()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { executeAsync, isExecuting } = useAction(LoginAction, {
    onSuccess: () => {
      toast.success('Logged in successfully')
      // Use setTimeout to ensure cookie is set before navigation
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Invalid credentials')
      setIsAuthenticating(false)
    },
  })

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        toast.error(error)
      }, 500)
    }
  }, [error])

  useEffect(() => {
    return () => setIsAuthenticating(false)
  }, [setIsAuthenticating])

  const onSubmit = form.handleSubmit((data) => {
    setIsAuthenticating(true)
    executeAsync(data)
  })

  if (isAuthenticating) {
    return (
      <LoadingSvgScreen
        className="fixed inset-0 z-50"
        message="Preparing your dashboard..."
      />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.94)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
      <AuthHeader
        title="Welcome back"
        description="Please enter your details to sign in."
      />
      <div className="mt-5 flex grow flex-col justify-center space-y-4">
        <AuthProviderButtons />
        <div className="relative flex items-center">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink rounded-full border p-1 text-[9px] text-gray-400">
            OR
          </span>
          <div className="grow border-t border-gray-200"></div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email..."
              className="w-full rounded-md px-4 py-2"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              className="w-full rounded-md px-4 py-2"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
              required
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="transition-ease text-sm text-[hsl(var(--muted-foreground))] underline-offset-2 hover:text-[hsl(var(--foreground))] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="transition-ease w-full rounded-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--foreground)/0.88)]"
            disabled={isAuthenticating}
            isLoading={isExecuting}
          >
            Sign in
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Don&apos;t have an account yet?{' '}
        <Link
          href="/register"
          className="transition-ease font-medium text-[hsl(var(--foreground))] underline underline-offset-2"
        >
          Sign Up
        </Link>
      </p>
    </div>
  )
}

export default LoginCard

'use client'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@ephemere/ui/components/ui/input-otp.tsx'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AuthHeader } from '@/components/auth/auth-header'
import { useRegisterContext } from '@/context/RegistryContext'
import {
  CreateUserAccountAction,
  SendVerificationOtpAction,
} from '@/lib/actions/authActions'

import { Button } from '../shared/Button'

const VerifyEmailCard = () => {
  const { email, password, firstName, lastName } = useRegisterContext()
  const [isInvalidCode, setIsInvalidCode] = useState(false)
  const [code, setCode] = useState('')
  const router = useRouter()

  const { executeAsync, isExecuting } = useAction(CreateUserAccountAction, {
    async onSuccess() {
      toast.success('Account created! Redirecting to dashboard...')
      // Use setTimeout to ensure cookie is set before navigation
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    },
    onError({ error }) {
      toast.error(error.serverError)
      setCode('')
      setIsInvalidCode(true)
    },
  })

  const { executeAsync: resendCode, isExecuting: isResending } = useAction(
    SendVerificationOtpAction,
    {
      async onSuccess() {
        toast.success('Verification code resent!')
      },
      onError({ error }) {
        toast.error(error.serverError)
      },
    }
  )

  useEffect(() => {
    if (!email || !password) {
      router.replace('/register')
    }
  }, [email, password, router])

  if (!email || !password) {
    return null
  }

  const handleComplete = async (value: string) => {
    if (value.length !== 6) return

    try {
      const response = await executeAsync({
        email,
        password,
        code: value,
        firstName,
        lastName: lastName || '',
      })
      if (response?.data?.message === 'ok') {
        setCode('')
      }
    } catch (err) {
      console.error('Error creating account:', err)
    }
  }

  const handleResendCode = async () => {
    try {
      await resendCode({ email })
      setCode('')
      setIsInvalidCode(false)
    } catch (err) {
      console.error('Error resending code:', err)
    }
  }

  return (
    <div className="flex aspect-square w-full max-w-[400px] flex-col justify-between rounded-2xl border bg-white p-8 shadow-2xl shadow-cyan-500/20">
      <AuthHeader
        title="Verify Email"
        description="Enter the 6-digit code sent to your email"
      />
      <div className="flex grow flex-col items-center justify-center space-y-6">
        <p className="text-center text-sm text-gray-600">{email}</p>
        <InputOTP maxLength={6} value={code} onChange={setCode} onComplete={handleComplete}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {isInvalidCode && <p className="text-sm text-red-500">Invalid code. Please try again.</p>}
      </div>
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          className="transition-ease w-full bg-black text-white hover:bg-black/90 hover:ring hover:ring-slate-200 disabled:opacity-50"
          disabled={code.length !== 6 || isExecuting}
          isLoading={isExecuting}
          onClick={() => handleComplete(code)}
        >
          Verify
        </Button>
        <button
          onClick={handleResendCode}
          disabled={isResending}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {isResending ? 'Sending...' : 'Resend Code'}
        </button>
      </div>
    </div>
  )
}

export default VerifyEmailCard

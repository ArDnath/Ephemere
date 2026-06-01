import type { Metadata } from 'next'

import LoginCard from '@/components/auth/LoginCard'
import EphemereLogo from '@/components/icons/animated/EphemereLogo'

export const metadata: Metadata = {
  title: 'Login',
  description:
    'Log in to your Ephemere account to access real-time chat rooms and seamless communication.',
  keywords: ['login', 'chat', 'real-time', 'communication', 'ephemere'],
}

const ERROR_MESSAGES = {
  no_user_found: 'No user account was found. Please try logging in again.',
  something_went_wrong: 'Something went wrong. Please try again later.',
} as const

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { error } = (await searchParams) as { error?: string }

  const errorMessage = error
    ? ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] ||
      'An error occurred. Please try again.'
    : undefined

  return (
    <div className="gridGradient container h-screen w-screen">
      <div className="py-10">
        <EphemereLogo />
      </div>
      <div className="flex-center w-full py-10">
        <LoginCard error={errorMessage} />
      </div>
    </div>
  )
}

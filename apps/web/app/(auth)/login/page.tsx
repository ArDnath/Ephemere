
import type { Metadata } from 'next'

import LoginCard from '@/components/auth/LoginCard'
import EphemereLogo from '@/components/icons/animated/EphemereLogo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

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
    <div
      className="relative flex min-h-screen w-screen flex-col overflow-hidden bg-[hsl(var(--background))] bg-cover bg-center bg-no-repeat px-4"
      style={{
        backgroundImage:
          'linear-gradient(hsl(var(--background) / 0.76), hsl(var(--background) / 0.86)), url("https://backiee.com/static/wallpapers/1920x1080/428961.jpg")',
      }}
    >
      {/* Centered container tracking both the header items and the login form */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 py-24">

        {/* Header elements: Anchored directly on top of the card */}
        <div className="flex w-full max-w-md items-center justify-center gap-4 px-2">
          <EphemereLogo />
          <ThemeToggle />
        </div>

        {/* The Login Card */}
        <LoginCard error={errorMessage} />

      </div>
    </div>
  )
}

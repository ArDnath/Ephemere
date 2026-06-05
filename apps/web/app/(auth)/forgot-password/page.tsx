import type { Metadata } from 'next'

import ForgetPassword from '@/components/auth/ForgetPassword'
import EphemereLogo from '@/components/icons/animated/EphemereLogo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description:
    'Reset your Ephemere account password to regain access to your account.',
  keywords: ['forgot password', 'reset password', 'account recovery', 'ephemere'],
}

export default function ForgetPasswordPage() {
  return (
    <div
      className="relative flex min-h-screen w-screen flex-col overflow-hidden bg-[hsl(var(--background))] bg-cover bg-center bg-no-repeat px-4"
      style={{
        backgroundImage:
          'linear-gradient(hsl(var(--background) / 0.76), hsl(var(--background) / 0.86)), url("https://backiee.com/static/wallpapers/1920x1080/428961.jpg")',
      }}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-5 sm:px-10">
        <EphemereLogo />
        <ThemeToggle />
      </div>
      <div className="flex min-h-screen w-full items-center justify-center py-24">
        <ForgetPassword />
      </div>
    </div>
  )
}

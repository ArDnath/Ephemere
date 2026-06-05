import type { Metadata } from 'next'

import RegistryForm from '@/components/auth/RegistryForm'
import EphemereLogo from '@/components/icons/animated/EphemereLogo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export const metadata: Metadata = {
  title: 'Register',
  description:
    'Create your Ephemere account to unlock personalized chat experiences and seamless communication.',
  keywords: ['register', 'signup', 'create account', 'chat', 'ephemere'],
}

export default function SignUpPage() {
  return (
    <div
      className="relative flex min-h-screen w-screen flex-col overflow-hidden bg-[hsl(var(--background))] bg-cover bg-center bg-no-repeat px-4"
      style={{
        backgroundImage:
          'linear-gradient(hsl(var(--background) / 0.54), hsl(var(--background) / 0.74)), url("https://backiee.com/static/wallpapers/1920x1080/428961.jpg")',
      }}
    >
      {/* Centered container that holds both the header elements and the form */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 py-24">

        {/* Header elements: Now sits naturally right above the form */}
        <div className="flex w-full max-w-md items-center justify-center gap-4 px-2">
          <EphemereLogo />
          <ThemeToggle />
        </div>

        {/* The Registration Form */}
        <RegistryForm />

      </div>
    </div>
  )
}

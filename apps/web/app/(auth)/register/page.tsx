import type { Metadata } from 'next'

import RegistryForm from '@/components/auth/RegistryForm'
import EphemereLogo from '@/components/icons/animated/EphemereLogo'

export const metadata: Metadata = {
  title: 'Register',
  description:
    'Create your Ephemere account to unlock personalized chat experiences and seamless communication.',
  keywords: ['register', 'signup', 'create account', 'chat', 'ephemere'],
}

export default function SignUpPage() {
  return (
    <div className="gridGradient container h-screen w-screen">
      <div className="py-10">
        <EphemereLogo />
      </div>
      <div className="flex-center w-full py-10">
        <RegistryForm />
      </div>
    </div>
  )
}

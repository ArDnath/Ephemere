import type { Metadata } from 'next'

import ForgetPassword from '@/components/auth/ForgetPassword'
import EphemereLogo from '@/components/icons/animated/EphemereLogo'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description:
    'Reset your Ephemere account password to regain access to your account.',
  keywords: ['forgot password', 'reset password', 'account recovery', 'ephemere'],
}

export default function ForgetPasswordPage() {
  return (
    <div className="gridGradient container h-screen w-screen">
      <div className="py-10">
        <EphemereLogo />
      </div>
      <div className="flex-center w-full py-10">
        <ForgetPassword />
      </div>
    </div>
  )
}

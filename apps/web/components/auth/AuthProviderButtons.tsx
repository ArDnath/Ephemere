'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'

import { SocialAuthButtons } from './social-auth-buttons'

const AuthProviderButtons = () => {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!googleClientId) {
    return (
      <div className="flex w-full flex-col gap-3">
        <SocialAuthButtons showGoogle={false} />
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="flex w-full flex-col gap-3">
        <SocialAuthButtons />
      </div>
    </GoogleOAuthProvider>
  )
}

export default AuthProviderButtons

'use client'

import type { ReactNode } from 'react'

import { AuthHeader } from './auth-header'
import AuthProviderButtons from './AuthProviderButtons'

type AuthCardShellProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  showProviders?: boolean
}

export function AuthCardShell({
  title,
  description,
  children,
  footer,
  showProviders = true,
}: AuthCardShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.94)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
      <AuthHeader title={title} description={description} />

      <div className="mt-5 flex grow flex-col justify-center space-y-4">
        {showProviders ? (
          <>
            <AuthProviderButtons />
            <div className="relative flex items-center">
              <div className="grow border-t border-gray-200" />
              <span className="shrink rounded-full border p-1 text-[9px] text-gray-400">
                OR
              </span>
              <div className="grow border-t border-gray-200" />
            </div>
          </>
        ) : null}

        {children}
      </div>

      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  )
}

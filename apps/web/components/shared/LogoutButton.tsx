'use client'

import { cn } from '@ephemere/ui/utils'
import { useAction } from 'next-safe-action/hooks'
import type { ReactNode } from 'react'

import { logout } from '@/lib/actions/authActions'

import Downitem from '../Downitem'
import { LogoutIcon } from '../icons/animated/logout'

type LogoutButtonProps = {
  className?: string
  icon?: ReactNode
}

export function LogoutButton({ className, icon }: LogoutButtonProps) {
  const { execute: handleLogout } = useAction(logout, {
    onSuccess: () => {
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    },
  })

  if (className) {
    return (
      <button
        type="button"
        onClick={() => handleLogout()}
        className={cn(className)}
      >
        {icon}
        <span>Logout</span>
      </button>
    )
  }

  return (
    <Downitem icon={<LogoutIcon />} title="Logout" onClick={handleLogout} />
  )
}

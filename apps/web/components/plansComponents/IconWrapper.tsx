import { LucideIcon } from 'lucide-react'
import React from 'react'

interface IconWrapperProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'default' | 'simple'
}

export function IconWrapper({
  icon: Icon,
  size = 'md',
  className = '',
  variant = 'default',
}: IconWrapperProps) {
  const sizeStyles = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  }

  if (variant === 'simple') {
    return (
      <div className={`inline-flex items-center justify-center text-[hsl(var(--foreground))] ${className}`}>
        <Icon className={sizeStyles[size]} />
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-[hsl(var(--muted))] p-3 ${className}`}
    >
      <Icon className={`${sizeStyles[size]} text-[hsl(var(--foreground))]`} />
    </div>
  )
}

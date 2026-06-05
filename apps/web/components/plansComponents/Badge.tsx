import React from 'react'

interface BadgeProps {
  children: React.ReactNode
}

export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex items-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2.5 py-1 text-xs font-medium tracking-wide text-[hsl(var(--foreground))]">
      {children}
    </span>
  )
}

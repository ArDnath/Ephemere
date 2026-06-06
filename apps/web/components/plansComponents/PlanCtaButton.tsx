'use client'

import { Button } from '../shared/Button'

type PlanCtaButtonProps = {
  label: string
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
}

export function PlanCtaButton({
  label,
  disabled,
  isLoading,
  onClick,
}: PlanCtaButtonProps) {
  return (
    <Button
      className="group relative mt-3 h-12 w-full overflow-hidden rounded-lg border border-[hsl(var(--foreground)/0.14)] bg-[hsl(var(--foreground))] text-[hsl(var(--background))] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
      isLoading={isLoading}
    >
      <span className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(to_right,transparent,hsl(var(--background)/0.55),transparent)]" />
      <span className="relative z-10 font-medium">{label}</span>
    </Button>
  )
}

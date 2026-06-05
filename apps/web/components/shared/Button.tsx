import { Button as Button2 } from '@ephemere/ui/components/ui/button.tsx'
import { LoadingSpinner } from '@ephemere/ui/icons/spinner.tsx'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  isLoading?: boolean
}

export const Button = ({
  children,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <Button2
      {...props}
      disabled={isLoading || disabled}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60 ${
        isLoading
          ? 'cursor-not-allowed border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] outline-none'
          : ''
      }`}
    >
      {isLoading ? <LoadingSpinner /> : children}
    </Button2>
  )
}

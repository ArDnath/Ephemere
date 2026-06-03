import Link from 'next/link'
import { ComponentProps, ReactNode } from 'react'

interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string
  variant?: 'primary' | 'default'
  children: ReactNode
}

const LinkButton = ({
  href,
  variant = 'default',
  children,
  ...props
}: LinkButtonProps) => {
  const baseStyles =
    'inline-flex z-10 items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2'
  const variantStyles =
    variant === 'primary'
      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] focus:ring-[hsl(var(--primary)/0.2)]'
      : 'border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-md hover:bg-[hsl(var(--secondary))] focus:ring-[hsl(var(--primary)/0.2)]'

  return (
    <Link href={href} {...props} className={`${baseStyles} ${variantStyles}`}>
      {children}
    </Link>
  )
}

export default LinkButton

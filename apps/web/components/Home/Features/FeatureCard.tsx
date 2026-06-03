import { cn } from '@ephemere/ui/utils'
import { useState } from 'react'

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  className?: string
  index: number
  label?: string
  hoverColor?: string
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  index,
  label,
  hoverColor = '#0EA5E9',
}: FeatureCardProps) {
  const direction = index < 4 ? 'up' : 'down'
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'group relative flex flex-col py-10',
        direction === 'up' ? 'lg:border-b lg:border-dashed' : '',
        'lg:border-r lg:border-dashed border-[hsl(var(--border))]',
        index === 0 || index === 4 ? 'lg:border-l lg:border-dashed' : '',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'group pointer-events-none absolute inset-0 h-full w-full opacity-0 transition duration-200 group-hover:opacity-100',
          direction === 'up'
            ? 'bg-gradient-to-t from-[hsl(var(--primary)/0.08)] to-transparent'
            : 'bg-gradient-to-b from-[hsl(var(--accent)/0.08)] to-transparent'
        )}
      ></div>
      <div className="relative z-10 mb-4 size-7 px-10 transition-all duration-300 group-hover:scale-125">
        <div
          className="transition-colors duration-200 ease-in-out"
          style={{
            color: isHovered ? hoverColor : 'hsl(var(--muted-foreground))',
          }}
        >
          {icon}
        </div>
      </div>
      <div className="relative z-10 mb-2 flex items-center px-10 text-lg font-bold text-[hsl(var(--foreground))]">
        <div className="absolute inset-y-0 left-0 h-6 w-1 rounded-r-full bg-[hsl(var(--border))] transition duration-200 group-hover:bg-[hsl(var(--primary))]"></div>
        <span className="inline-block transition duration-200 group-hover:translate-x-2">
          {title}
          {label && (
            <span className="ml-5 inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.10)] px-2 py-1 text-xs font-medium text-[hsl(var(--primary))] ring-1 ring-inset ring-[hsl(var(--primary)/0.20)]">
              {label}
            </span>
          )}
        </span>
      </div>
      <p className="relative z-10 mx-auto max-w-xs px-10 text-sm text-[hsl(var(--muted-foreground))]">
        {description}
      </p>
    </div>
  )
}

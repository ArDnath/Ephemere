import { Card } from '@ephemere/ui/components/ui/card.tsx'

import { PricingPlan } from '@/types'

import { Badge } from './Badge'
import { Feature } from './Feature'
import { PricingCardButton } from './PricingCardButton'

export function PricingCard({
  name,
  description,
  price,
  badge,
  features,
}: PricingPlan) {
  return (
    <Card
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-transparent p-6 text-[hsl(var(--foreground))] shadow-none transition-colors sm:p-8 ${name.toLowerCase() === 'pro' ? 'border-[hsl(var(--foreground)/0.16)]' : ''}`}
    >
      <div className="relative z-10 mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-px bg-[hsl(var(--border))]" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">
              Plan
            </p>
            <h2 className="text-xl font-medium tracking-tight sm:text-2xl">
              {name}
            </h2>
          </div>
        </div>

        {badge && <Badge>{badge}</Badge>}
      </div>

      <div className="relative z-10 mb-6">
        <p className="max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
        <div className="mt-5 flex items-end gap-2">
          <span className="text-3xl font-medium tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            ${price}
          </span>
          <span className="pb-1 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            /month
          </span>
        </div>
      </div>

      <div className="relative z-10 my-6 flex-1 space-y-4 border-t border-[hsl(var(--border))] pt-6">
        {features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </div>

      <div className="relative z-10 mt-auto pt-4">
        <PricingCardButton name={name} />
      </div>
    </Card>
  )
}

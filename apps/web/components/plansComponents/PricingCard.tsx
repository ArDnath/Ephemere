import { Card } from '@ephemere/ui/components/ui/card.tsx'

import React from 'react'

import { PricingPlan } from '@/types'

import { Badge } from './Badge'
import { Feature } from './Feature'
import { IconWrapper } from './IconWrapper'
import { PricingCardButton } from './PricingCardButton'

export function PricingCard({
  name,
  icon,
  description,
  price,
  badge,
  features,
}: PricingPlan) {
  return (
    <Card
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-zinc-900/80 to-black p-8 text-white transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_12px_40px_rgba(255,255,255,0.08)] ${
        name.toLowerCase() === 'pro' ? 'shadow-lg border-white/20 ring-1 ring-white/20 shadow-white/5' : 'shadow-sm'
      }`}
    >
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)]" />
      
      {/* Corner crosshairs */}
      <div className="pointer-events-none absolute left-4 top-4 h-2 w-2 rotate-45 border border-white/20" />
      <div className="pointer-events-none absolute right-4 bottom-4 h-2 w-2 rotate-45 border border-white/20" />

      <div className="relative z-10 mb-5 flex items-start justify-between gap-3">
        <IconWrapper icon={icon} size="md" />

        {badge && <Badge>{badge}</Badge>}
      </div>

      <div className="relative z-10 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          {name}
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          {description}
        </p>
        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tight text-white">
            ${price}
          </span>
          <span className="text-sm font-medium text-white/60">
            /month
          </span>
        </div>
      </div>
      
      <div className="relative z-10 my-6 space-y-4 flex-1">
        {features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </div>

      <div className="relative z-10 pt-4 mt-auto">
        <PricingCardButton name={name} />
      </div>
    </Card>
  )
}

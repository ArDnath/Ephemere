import React from 'react'

import { PricingFeature } from '@/types'

import { IconWrapper } from './IconWrapper'

export function Feature({ icon, title, description }: PricingFeature) {
  return (
    <div className="flex items-start gap-3 py-2">
      <IconWrapper icon={icon} size="sm" variant="simple" className="mt-0.5" />
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-snug text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      </div>
    </div>
  )
}

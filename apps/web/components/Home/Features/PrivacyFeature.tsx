import { Lock, Shield } from 'lucide-react'
import { useState } from 'react'

import { GradientShield } from '@/components/icons/GradientShield'
import { GridItem } from '@/components/ui/GridItem'
import HackyText from '@/components/ui/HackyText'

const PrivacyFeature = () => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <GridItem
      delay={0.2}
      className="col-span-1 row-span-1 xl:col-span-2 xl:row-span-1"
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <HackyText
          isHovered={isHovered}
          text="Built for Privacy"
          className="text-lg font-medium text-[hsl(var(--foreground))]"
        />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          End-to-end encryption ensures your conversations remain private.
        </p>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 size-full bg-gradient-to-t from-[hsl(var(--card))] via-transparent to-transparent" />
        <div className="flex-center translate-y-12">
          <GradientShield className="fill-[hsl(var(--primary)/0.08)] stroke-none" />
          <Lock className="absolute stroke-[hsl(var(--foreground)/0.5)]" />
          <GradientShield className="absolute size-52 fill-[hsl(var(--primary)/0.12)] stroke-[hsl(var(--border))] stroke-[0.5]" />
          <Shield className="absolute size-32 fill-[hsl(var(--accent)/0.12)] stroke-[hsl(var(--border))] stroke-[0.5]" />
        </div>
      </div>{' '}
    </GridItem>
  )
}

export default PrivacyFeature

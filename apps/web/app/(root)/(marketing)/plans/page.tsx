import { Metadata } from 'next'

import { PricingPlans } from '@/components/plansComponents/PricingPlans'

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description: 'Explore our pricing plans to find the best fit for your needs.',
  keywords: ['pricing', 'plans', 'subscription', 'ephemere', 'chat'],
}

const page = () => {
  return (
    <div className="relative overflow-hidden bg-[hsl(var(--background))]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">
            Plans
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
            Choose your plan
          </h1>
          <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
            Pick the room limits that match your workflow.
          </p>
        </div>
        <PricingPlans />
      </div>
    </div>
  )
}
export default page

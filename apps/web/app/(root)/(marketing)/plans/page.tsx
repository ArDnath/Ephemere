import { Metadata } from 'next'

import { PricingPlans } from '@/components/plansComponents/PricingPlans'

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description: 'Explore our pricing plans to find the best fit for your needs.',
  keywords: ['pricing', 'plans', 'subscription', 'ephemere', 'chat'],
}

const page = () => {
  return (
    <div className="bg-[hsl(var(--background))]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
            Choose your plan
          </h1>
          <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))] sm:text-base">
            Find a plan that fits your needs
          </p>
        </div>
        <PricingPlans />
      </div>
    </div>
  )
}
export default page

import { plans } from '@/constants'

import { PricingCard } from './PricingCard'

export function PricingPlans() {
  return (
    <div className="relative grid w-full grid-cols-1 gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <PricingCard key={plan.name} {...plan} />
      ))}
    </div>
  )
}

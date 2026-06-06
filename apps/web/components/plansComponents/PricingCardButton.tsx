'use client'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { useUser } from '@/hooks/useSession'
import {
  activateProPlanAction,
  activateFreePlanAction,
} from '@/lib/actions/plansActions'

import { ProPlanDialog } from './ProPlanDialog'
import { PlanCtaButton } from './PlanCtaButton'

interface PricingCardButtonProps {
  name: string
}

export function PricingCardButton({ name }: PricingCardButtonProps) {
  const { data, isLoading } = useUser()
  const router = useRouter()

  const action =
    name.toLowerCase() === 'pro'
      ? activateProPlanAction
      : activateFreePlanAction

  const { executeAsync, isExecuting } = useAction(action, {
    onSuccess: () => {
      toast.success(`Successfully activated ${name} plan`)
      router.push('/dashboard')
    },
    onError: () => {
      toast.error('Failed to activate plan')
    },
  })

  const isPro = !!data?.user?.subscription?.isPro
  const isSubscription = !!data?.user?.subscription

  const handleClick = () => {
    if (!data?.user) {
      toast.info('Please login first')
    } else {
      executeAsync()
    }
  }

  if (name.toLowerCase() === 'pro') {
    return <ProPlanDialog isPro={isPro} isLoading={isLoading} />
  }

  return (
    <PlanCtaButton
      label="Get started"
      onClick={handleClick}
      disabled={isExecuting || isSubscription || isLoading}
      isLoading={isExecuting}
    />
  )
}

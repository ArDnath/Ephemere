'use client'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { useUser } from '@/hooks/useSession'
import {
  activateProPlanAction,
  activateFreePlanAction,
} from '@/lib/actions/plansActions'

import { Button } from '../shared/Button'

import { ProPlanDialog } from './ProPlanDialog'

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
    <Button
  className="
    group
    relative
    mt-3
    h-12
    w-full
    overflow-hidden
    rounded-2xl
    border
    border-white/10
    bg-gradient-to-b
    from-zinc-900
    to-black
    text-white
    transition-all
    duration-300
    hover:border-white/20
    hover:shadow-[0_12px_40px_rgba(255,255,255,0.08)]
    hover:-translate-y-1
    disabled:opacity-50
  "
  onClick={handleClick}
  disabled={isExecuting || isSubscription || isLoading}
  isLoading={isExecuting}
>
  <div
    className="
      absolute
      inset-0
      opacity-0
      transition-opacity
      duration-300
      group-hover:opacity-100
      bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)]
    "
  />

  <div
    className="
      absolute
      left-3
      top-3
      h-2
      w-2
      rotate-45
      border
      border-white/40
    "
  />

  <div
    className="
      absolute
      right-3
      bottom-3
      h-2
      w-2
      rotate-45
      border
      border-white/40
    "
  />

  <span className="relative z-10 font-medium tracking-wide">
    Get Started →
  </span>
</Button>
  )
}

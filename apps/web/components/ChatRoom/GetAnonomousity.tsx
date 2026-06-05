'use client'

import { Info } from 'lucide-react'
import { useState } from 'react'

import IdentityToggler from '@/components/Join-Room/IdentityToggler'
import { Button } from '@/components/shared/Button'
import { useIdentityStore } from '@/lib/store/useIdentityStore'

import EphemereLogo from '../icons/animated/EphemereLogo'

export default function GetAnonomousity() {
  const { setAnonymous } = useIdentityStore()
  const [isAnonymous, setIsAnonymous] = useState(false)

  const handleAnonymousChoice = () => {
    setAnonymous(isAnonymous)
  }

  return (
    <div className="flex-center mx-auto min-h-screen w-screen flex-col bg-[hsl(var(--background))] bg-[repeating-linear-gradient(115deg,hsl(var(--border)/0.55)_0_1px,transparent_1px_7px)] p-4 text-[hsl(var(--foreground))] sm:p-6 lg:p-10">
      <div className="">
        <EphemereLogo />
      </div>
      <div className="transition-ease xs:max-w-[90%] m-auto w-full max-w-[95%] space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.94)] p-4 shadow-sm backdrop-blur sm:max-w-[450px] sm:space-y-6 sm:p-8 md:p-10">
        <div>
          <h1 className="mb-2 text-xl font-semibold sm:mb-4 sm:text-2xl md:text-3xl">
            Choose Your Identity
          </h1>
          <p className="mb-3 text-xs text-[hsl(var(--muted-foreground))] sm:mb-6 sm:text-base">
            Select how you want to appear in this chat room. You can choose to
            participate anonymously or use your account identity.
          </p>
        </div>

        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Info className="mt-0.5 size-4 text-[hsl(var(--foreground))] sm:size-5" />
            <div>
              <h3 className="text-sm font-medium text-[hsl(var(--foreground))] sm:text-base">
                Anonymous Mode
              </h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                When anonymous, your real identity will be hidden and
                you&apos;ll be assigned a temporary username. Other participants
                won&apos;t be able to see your account details.
              </p>
            </div>
          </div>
        </div>

        <IdentityToggler
          onChange={(anonymous) => setIsAnonymous(anonymous)}
          defaultChecked={false}
        />

        <div className="flex justify-end">
          <Button
            onClick={handleAnonymousChoice}
            className="w-full min-w-[100px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ephemere/ui/components/ui/dialog.tsx'
import { Mail, Twitter } from 'lucide-react'
import Link from 'next/link'

import { Button } from '../shared/Button'

import { PlanCtaButton } from './PlanCtaButton'

interface ProPlanDialogProps {
  isPro: boolean
  isLoading: boolean
}

export function ProPlanDialog({ isPro, isLoading }: ProPlanDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <PlanCtaButton label="Get Pro access" disabled={isPro || isLoading} />
      </DialogTrigger>
      <DialogContent className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-[var(--shadow-lg)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))]">
            Get Pro Plan For Free!
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4 text-[hsl(var(--muted-foreground))]">
            <p>
              Activate the free trial, then contact me through X or email and I
              will upgrade the account to Pro for free.
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Activate the free trial</li>
              <li>Reach out through X or email</li>
              <li>Receive the Pro upgrade</li>
            </ol>
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Link
                href="https://x.com/AriyamanDe12_24"
                target="_blank"
                className="flex-1"
              >
                <Button className="w-full">
                  <Twitter className="mr-2 size-4" />
                  Connect on X
                </Button>
              </Link>
              <Link href="mailto:ariyamandebnath.ad@gmail.com" className="flex-1">
                <Button className="w-full">
                  <Mail className="mr-2 size-4" />
                  Contact Me
                </Button>
              </Link>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

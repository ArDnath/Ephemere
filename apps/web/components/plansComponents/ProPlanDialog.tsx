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

interface ProPlanDialogProps {
  isPro: boolean
  isLoading: boolean
}

export function ProPlanDialog({ isPro, isLoading }: ProPlanDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
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
          disabled={isPro || isLoading}
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
            Get Pro Access →
          </span>
        </Button>
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
            <div className="flex gap-4 pt-4">
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

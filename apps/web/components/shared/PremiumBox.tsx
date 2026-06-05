import { Button } from '@ephemere/ui/components/ui/button.tsx'
import Link from 'next/link'

const PremiumBox = () => {
  return (
    <div className="space-y-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition-colors hover:border-[hsl(var(--foreground)/0.28)]">
      <div>
        <p className="text-xs font-medium uppercase text-[hsl(var(--muted-foreground))]">
          Premium
        </p>
        <h3 className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">
          Unlock more room control
        </h3>
      </div>
      <div className="space-y-1.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
        <p>Longer room sessions</p>
        <p>Saved room history</p>
        <p>Priority realtime limits</p>
      </div>
      <Link href="/plans" className="block">
        <Button className="mt-1 w-full rounded-md border border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] text-xs font-medium text-[hsl(var(--background))] transition-all duration-200 ease-in-out hover:bg-[hsl(var(--foreground)/0.88)] active:scale-[0.98]">
          View Pro
        </Button>
      </Link>
    </div>
  )
}

export default PremiumBox

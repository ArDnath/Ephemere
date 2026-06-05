'use client'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@ephemere/ui/components/ui/dialog.tsx'
import { Drawer, DrawerContent } from '@ephemere/ui/components/ui/drawer.tsx'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

import { useMediaQuery } from '@/hooks/use-media-query'

interface ResponsiveModalProps {
  children: React.ReactNode
  title?: string
  className?: string
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

export const ResponsiveModal = ({
  children,
  title,
  className = '',
  onOpenChange,
  open = true,
}: ResponsiveModalProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (!open) {
    return null
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`animate-scale-in max-h-[95vh] max-w-[450px] overflow-y-auto border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 text-[hsl(var(--card-foreground))] shadow-[var(--shadow-lg)] ${className}`}
        >
          <VisuallyHidden.Root>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden.Root>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-[hsl(var(--card-foreground))]">
        {' '}
        <VisuallyHidden.Root>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden.Root>
        <div className="px-4">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}

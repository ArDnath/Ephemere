'use client'

import { cn } from '@ephemere/ui/utils'
import { motion } from 'framer-motion'

interface GridItemProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
  delay?: number
}

const GridItem = ({
  children,
  className,
  animate = true,
  delay = 0,
}: GridItemProps) => {
  const baseClasses = cn(
    'relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.78)] px-8 py-5 backdrop-blur',
    'shadow-[var(--shadow-sm)]',

    className
  )

  if (!animate) {
    return <div className={baseClasses}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      viewport={{ once: true }}
      className={baseClasses}
    >
      {children}
    </motion.div>
  )
}

export { GridItem }

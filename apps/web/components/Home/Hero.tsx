'use client'

import GridPattern from '@ephemere/ui/components/ui/GridPattern.tsx'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FlaskConical } from 'lucide-react'

import { Button } from '../shared/Button'

import DemoChatAnimated from './DemoChatAnimated'

export const Hero = () => {
  return (
    <section
      id="hero"
      className="relative mx-2 mt-16 overflow-hidden rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.68)] p-4 shadow-[var(--shadow-md)] backdrop-blur-xl sm:mx-10 sm:mt-20 sm:p-10"
    >
      <div className="relative overflow-hidden rounded-[22px]">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-300/20 via-sky-50/20 to-emerald-300/15 dark:from-sky-400/10 dark:via-transparent dark:to-emerald-300/10" />
        <div className="relative p-3 sm:p-6">
          <GridPattern
            width={42}
            height={42}
            className="absolute inset-0 stroke-[hsl(var(--divider))] opacity-60 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
          />
          <div className="relative z-10 mx-auto max-w-6xl px-2 sm:px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mx-auto mb-5 flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.72)] px-4 py-2 text-xs font-medium text-[hsl(var(--muted-foreground))] shadow-sm sm:px-5 sm:text-sm"
              >
                <FlaskConical className="size-4 text-[hsl(var(--primary))]" />
                <motion.span
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Now available with smoother rooms
                </motion.span>
              </motion.div>

              <h1 className="font-sans text-4xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl lg:text-6xl">
                Real-time chat designed for focus,
                <span className="block text-gradient">clarity, and speed.</span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mx-auto mt-6 max-w-2xl px-1 text-base text-[hsl(var(--muted-foreground))] sm:mt-10 sm:px-4 sm:text-lg"
              >
                Create rooms instantly and stay in the flow with a minimal
                interface, geometric linework, and less visual clutter.
              </motion.p>

              <motion.div
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-8 flex flex-col items-center justify-center gap-4 px-4 sm:mt-10 sm:flex-row sm:gap-6"
              >
                <Link href="/register" className="w-full sm:w-auto">
                  <Button className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary))] px-6 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[hsl(var(--primary)/0.9)] sm:text-base">
                    Get started
                  </Button>
                </Link>
                <Link href="/room/public" className="w-full sm:w-auto">
                  <Button className="inline-flex w-full items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.72)] px-6 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition duration-300 hover:border-[hsl(var(--primary)/0.35)] hover:bg-[hsl(var(--secondary))] sm:text-base">
                    Join public room
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.45)] to-transparent" />
      </div>
      <div className="mt-8 flex items-center justify-center rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.76)] p-4 shadow-[var(--shadow-sm)] backdrop-blur-xl sm:p-6">
        <DemoChatAnimated />
      </div>
    </section>
  )
}

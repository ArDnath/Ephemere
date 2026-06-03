'use client'

import GridPattern from '@ephemere/ui/components/ui/GridPattern.tsx'
import { cn } from '@ephemere/ui/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

import { EphemereLoading } from './EphemereLoading'

interface LoadingStateProps {
  fullScreen?: boolean
}

export const LoadingState = ({ fullScreen = false }: LoadingStateProps) => {
  const [loadingMessage, setLoadingMessage] = useState('Initializing...')
  const [randomSquares, setRandomSquares] = useState<[number, number][]>([])

  useEffect(() => {
    const squares = Array.from(
      { length: Math.floor(Math.random() * 11) + 10 },
      () => [Math.floor(Math.random() * 11) + 30, Math.floor(Math.random() * 20)] as [number, number]
    )
    setRandomSquares(squares)

    const messages = [
      { message: 'Establishing connection...', delay: 1200 },
      { message: 'Syncing room state...', delay: 2600 },
      { message: 'Finalizing your chat space...', delay: 4200 },
      { message: 'Ready in a moment...', delay: 6200 },
    ]

    const timeouts: NodeJS.Timeout[] = []

    messages.forEach(({ message, delay }) => {
      const timeout = setTimeout(() => {
        setLoadingMessage(message)
      }, delay)
      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [])

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#04060b] text-white',
        fullScreen && 'h-screen'
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_90%_20%,_rgba(132,211,255,0.12),_transparent_22%),linear-gradient(180deg,_rgba(10,14,24,0.96),_rgba(4,6,11,0.98))]" />
      <GridPattern
        width={40}
        height={40}
        className="absolute inset-0 opacity-30"
        strokeDasharray="4 4"
        squares={randomSquares}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex w-full max-w-xl flex-col items-center gap-8 rounded-[30px] border border-white/10 bg-white/5 px-8 py-12 text-center shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
      >
        <div className="flex h-28 w-28 items-center justify-center rounded-full border border-sky-200/30 bg-sky-200/10">
          <EphemereLoading className="scale-125 text-sky-100" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={loadingMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-lg font-semibold text-white">{loadingMessage}</p>
            <p className="text-sm text-slate-400">
              Keep chatting while we prepare your room — fun loading motion
              keeps the flow alive.
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

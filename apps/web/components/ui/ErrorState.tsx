'use client'

import { cn } from '@ephemere/ui/utils'
import { motion } from 'framer-motion'
import { AlertCircle, Clock3, WifiOff } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  details?: string
  fullScreen?: boolean
  variant?: 'connection' | 'expired' | 'generic'
}

const illustrationByVariant = {
  connection: {
    icon: WifiOff,
    label: 'connection lost',
    accent: 'from-sky-500/20 via-cyan-400/10 to-transparent',
  },
  expired: {
    icon: Clock3,
    label: 'room finished',
    accent: 'from-amber-500/20 via-orange-400/10 to-transparent',
  },
  generic: {
    icon: AlertCircle,
    label: 'status',
    accent: 'from-foreground/15 via-foreground/5 to-transparent',
  },
} as const

export const ErrorState = ({
  title = 'Connection Error',
  message = 'Unable to connect to the chat room. Please try again later.',
  details,
  fullScreen = false,
  variant = 'generic',
}: ErrorStateProps) => {
  const IllustrationIcon = illustrationByVariant[variant].icon

  return (
    <div
      className={cn(
        'relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[hsl(var(--background))] px-4 py-10 text-[hsl(var(--foreground))]',
        fullScreen && 'h-screen'
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top, hsl(var(--muted)/0.45), transparent_45%),linear-gradient(to_bottom,hsl(var(--background)),hsl(var(--background)))]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 px-2 sm:gap-8"
      >
        <div className="relative flex w-full items-center justify-center">
          <div
            className={cn(
              'absolute inset-x-8 top-8 h-36 rounded-full bg-gradient-to-b blur-3xl',
              illustrationByVariant[variant].accent
            )}
          />
          <svg
            viewBox="0 0 320 192"
            className="relative size-full max-h-64 w-full max-w-md"
            role="img"
            aria-label={illustrationByVariant[variant].label}
          >
            <defs>
              <linearGradient
                id={`error-grad-${variant}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.65" />
              </linearGradient>
            </defs>

            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.circle
                cx="160"
                cy="96"
                r="60"
                stroke={`url(#error-grad-${variant})`}
                strokeWidth="1.5"
                opacity="0.22"
                animate={{ scale: [0.98, 1.04, 0.98] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '160px 96px' }}
              />
              <motion.circle
                cx="160"
                cy="96"
                r="38"
                strokeWidth="1.5"
                opacity="0.5"
                animate={{
                  r: [38, 42, 38],
                  opacity: [0.42, 0.62, 0.42],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <path
                d="M104 96h42M174 96h42"
                strokeWidth="2"
                strokeDasharray="8 8"
                opacity="0.35"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  dur="1.8s"
                  repeatCount="indefinite"
                  values="16;0"
                />
              </path>
              <path
                d="M137 72l46 48M183 72l-46 48"
                strokeWidth="2"
                opacity="0.25"
              />
            </g>

            <circle
              cx="160"
              cy="96"
              r="28"
              fill="hsl(var(--card))"
              opacity="0.95"
            />
            <circle
              cx="160"
              cy="96"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.35"
            />

            <g fill="currentColor" opacity="0.45">
              <circle cx="62" cy="60" r="4">
                <animate
                  attributeName="opacity"
                  dur="2.4s"
                  values="0.2;0.9;0.2"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="256" cy="62" r="4">
                <animate
                  attributeName="opacity"
                  dur="2.8s"
                  values="0.2;0.85;0.2"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="70" cy="154" r="4">
                <animate
                  attributeName="opacity"
                  dur="2.2s"
                  values="0.2;0.8;0.2"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="248" cy="150" r="4">
                <animate
                  attributeName="opacity"
                  dur="3s"
                  values="0.2;0.8;0.2"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.85)] shadow-sm backdrop-blur">
              <IllustrationIcon className="size-6 text-[hsl(var(--foreground))]" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
          <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.7)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
            {illustrationByVariant[variant].label}
          </span>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            {title}
          </h2>
          <p className="max-w-[320px] text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:max-w-md sm:text-base">
            {message}
          </p>
          {details && (
            <p className="mt-1 max-w-[320px] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.76)] px-4 py-3 text-xs font-medium text-[hsl(var(--foreground))] shadow-sm sm:mt-2 sm:max-w-sm sm:text-sm md:max-w-md">
              {details}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

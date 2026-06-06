'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  Clock3,
  History,
  QrCode,
  Video,
  Waves,
} from 'lucide-react'
import type { ComponentType } from 'react'

import { cn } from '@ephemere/ui/utils'

type BentoTile = {
  title: string
  description: string
  badge?: string
  icon: ComponentType<{ className?: string }>
  tone: 'clock' | 'history' | 'qr' | 'chat' | 'ai' | 'video'
}

const tiles: BentoTile[] = [
  {
    title: 'Timed rooms',
    description: 'Rooms close on schedule so the conversation stays focused.',
    icon: Clock3,
    tone: 'clock',
  },
  {
    title: 'Story history',
    description: 'Saved rooms keep a clean record of what happened before.',
    icon: History,
    tone: 'history',
  },
  {
    title: 'Share link + QR',
    description: 'Invite people with a single copy action or a scan.',
    icon: QrCode,
    tone: 'qr',
  },
  {
    title: 'Realtime chat',
    description: 'Messages and reactions move through the room instantly.',
    icon: Waves,
    tone: 'chat',
  },
  {
    title: 'AI chat',
    description: 'Planned assistant features for faster help and room context.',
    icon: Brain,
    tone: 'ai',
    badge: 'Soon',
  },
  {
    title: 'Video calling',
    description: 'A future step toward richer live sessions.',
    icon: Video,
    tone: 'video',
    badge: 'Soon',
  },
]

function TileIcon({
  Icon,
}: {
  Icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex size-11 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-sm">
      <Icon className="size-5 text-[hsl(var(--foreground))]" />
    </div>
  )
}

function AnimatedGlyph({
  tone,
}: {
  tone: BentoTile['tone']
}) {
  switch (tone) {
    case 'clock':
      return (
        <svg viewBox="0 0 180 120" className="size-full" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeLinecap="round">
            <circle cx="90" cy="60" r="28" strokeOpacity="0.25" strokeWidth="1.5" />
            <motion.circle
              cx="90"
              cy="60"
              r="18"
              strokeOpacity="0.55"
              strokeWidth="1.5"
              animate={{ r: [18, 22, 18], opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.line
              x1="90"
              y1="60"
              x2="90"
              y2="44"
              strokeWidth="2"
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '90px 60px' }}
            />
            <path d="M90 32v8M118 60h-8M90 88v-8M62 60h8" strokeOpacity="0.4" strokeWidth="1.5" />
            <motion.circle
              cx="90"
              cy="60"
              r="36"
              strokeOpacity="0.18"
              strokeWidth="1"
              animate={{ opacity: [0.12, 0.28, 0.12] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        </svg>
      )
    case 'history':
      return (
        <svg viewBox="0 0 180 120" className="size-full" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeLinecap="round">
            <path d="M48 30v60" strokeOpacity="0.18" strokeWidth="2" />
            <path d="M90 22v76" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="5 7">
              <animate attributeName="stroke-dashoffset" dur="1.8s" repeatCount="indefinite" values="24;0" />
            </path>
            <path d="M132 38v44" strokeOpacity="0.18" strokeWidth="2" />
            {[
              { x: 48, y: 36 },
              { x: 90, y: 60 },
              { x: 132, y: 84 },
            ].map((node, index) => (
              <g key={`${node.x}-${node.y}`}>
                <circle cx={node.x} cy={node.y} r="8" fill="hsl(var(--background))" strokeOpacity="0.45" strokeWidth="1.5" />
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="3"
                  fill="currentColor"
                  animate={{ opacity: [0.25, 1, 0.25], scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.8, delay: index * 0.25, repeat: Infinity, ease: 'easeInOut' }}
                />
              </g>
            ))}
          </g>
        </svg>
      )
    case 'qr':
      return (
        <svg viewBox="0 0 180 120" className="size-full" aria-hidden="true">
          <rect x="40" y="20" width="50" height="50" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" />
          <rect x="90" y="20" width="50" height="50" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" />
          <rect x="40" y="70" width="50" height="30" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" />
          <rect x="90" y="70" width="50" height="30" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" />
          <motion.rect
            x="38"
            y="18"
            width="54"
            height="54"
            rx="6"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            animate={{ scale: [1, 1.03, 1], opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '65px 45px' }}
          />
          <motion.line
            x1="28"
            y1="40"
            x2="152"
            y2="40"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.35"
            animate={{ y1: [32, 40, 32], y2: [32, 40, 32] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <g fill="currentColor" opacity="0.9">
            <rect x="48" y="28" width="7" height="7" rx="1.5" />
            <rect x="60" y="28" width="7" height="7" rx="1.5" />
            <rect x="72" y="28" width="7" height="7" rx="1.5" />
            <rect x="48" y="40" width="7" height="7" rx="1.5" />
            <rect x="84" y="40" width="7" height="7" rx="1.5" />
            <rect x="96" y="40" width="7" height="7" rx="1.5" />
            <rect x="108" y="40" width="7" height="7" rx="1.5" />
            <rect x="60" y="52" width="7" height="7" rx="1.5" />
            <rect x="96" y="52" width="7" height="7" rx="1.5" />
            <rect x="72" y="76" width="7" height="7" rx="1.5" />
            <rect x="96" y="76" width="7" height="7" rx="1.5" />
          </g>
        </svg>
      )
    case 'chat':
      return (
        <svg viewBox="0 0 180 120" className="size-full" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M38 38h52c8 0 14 6 14 14v8c0 8-6 14-14 14H64l-14 14v-14H38c-8 0-14-6-14-14v-8c0-8 6-14 14-14Z" strokeOpacity="0.22" strokeWidth="1.5" />
            <path d="M90 54h52c8 0 14 6 14 14v8c0 8-6 14-14 14h-10v14l-14-14h-28c-8 0-14-6-14-14v-8c0-8 6-14 14-14Z" strokeOpacity="0.22" strokeWidth="1.5" />
            <motion.path
              d="M22 92c18-10 36-10 54 0s36 10 54 0 36-10 54 0"
              strokeOpacity="0.45"
              strokeWidth="2"
              strokeDasharray="8 8"
              animate={{ strokeDashoffset: [16, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            />
            <motion.circle
              cx="90"
              cy="60"
              r="9"
              fill="currentColor"
              animate={{ r: [9, 11, 9], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        </svg>
      )
    case 'ai':
      return (
        <svg viewBox="0 0 180 120" className="size-full" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeLinecap="round">
            <circle cx="90" cy="60" r="16" strokeOpacity="0.45" strokeWidth="1.5" />
            <motion.circle
              cx="90"
              cy="60"
              r="28"
              strokeOpacity="0.2"
              strokeWidth="1.5"
              animate={{ r: [28, 34, 28], opacity: [0.15, 0.45, 0.15] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {[
              [56, 44],
              [120, 36],
              [132, 78],
              [62, 82],
            ].map(([x, y], index) => (
              <motion.circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r="4"
                fill="currentColor"
                animate={{ opacity: [0.25, 1, 0.25], scale: [1, 1.3, 1] }}
                transition={{ duration: 2.1, delay: index * 0.25, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
            <path d="M90 44v-10M90 76v10M74 60H64M116 60h10" strokeOpacity="0.35" strokeWidth="1.5" />
          </g>
        </svg>
      )
    case 'video':
      return (
        <svg viewBox="0 0 180 120" className="size-full" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="42" y="38" width="68" height="44" rx="10" strokeOpacity="0.28" strokeWidth="1.5" />
            <path d="M110 52l24-12v32l-24-12Z" strokeOpacity="0.28" strokeWidth="1.5" />
            <motion.circle
              cx="76"
              cy="60"
              r="10"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              animate={{ r: [10, 14, 10], opacity: [0.3, 0.75, 0.3] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M28 60c8-8 16-8 24 0"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M24 48c12-14 24-14 36 0"
              strokeOpacity="0.22"
              strokeWidth="1.5"
              animate={{ opacity: [0.12, 0.5, 0.12] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        </svg>
      )
  }
}

function BentoTileCard({ item, index }: { item: BentoTile; index: number }) {
  const Icon = item.icon

  return (
    <motion.article
      className={cn(
        'group relative mb-px break-inside-avoid overflow-hidden bg-[hsl(var(--background))] p-4 shadow-[var(--shadow-sm)] sm:p-5'
      )}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_15%,hsl(var(--foreground)/0.02)_15.5%,transparent_16%),linear-gradient(225deg,transparent_15%,hsl(var(--foreground)/0.02)_15.5%,transparent_16%)] opacity-80" />

      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-xl">
              {item.title}
            </h3>
            <p className="max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              {item.description}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {item.badge && (
              <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                {item.badge}
              </span>
            )}
            <TileIcon Icon={Icon} />
          </div>
        </div>

        <div className="relative mt-auto overflow-hidden rounded-[16px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-3">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top, hsl(var(--foreground)/0.03), transparent_58%)]" />
          <div className="relative h-28 sm:h-32">
            <AnimatedGlyph tone={item.tone} />
          </div>
        </div>
      </div>
    </motion.article>
  )
}

const BentoSection = () => {
  return (
    <section className="py-20 sm:py-24" id="bento">
      <div className="container px-2 md:px-4 lg:px-8 xl:px-12">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl md:text-5xl">
            Built around short conversations.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
            Ephemere combines the current room workflow with the next set of
            collaboration tools, so the product feels useful now and clearly
            expandable later.
          </p>
        </motion.div>

        <div className="mt-10 rounded-[32px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-[var(--shadow-md)] sm:p-3 lg:p-4">
          <div className="overflow-hidden rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <div className="flex flex-col gap-2 border-b border-[hsl(var(--border))] px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">
                  Feature grid
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  Small tiles inside one larger frame.
                </p>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Hover, tap, and scan through the product story.
              </p>
            </div>

            <div className="columns-1 [column-gap:1px] md:columns-2 xl:columns-3">
              {tiles.map((item, index) => (
                <BentoTileCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BentoSection

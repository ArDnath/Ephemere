'use client'

import { motion } from 'framer-motion'
import { Clock3, MessageSquareText, Radio, ShieldCheck } from 'lucide-react'

const steps = [
  {
    title: 'Room opens',
    description: 'Create a temporary space and share one link.',
    icon: Radio,
  },
  {
    title: 'Messages sync',
    description: 'Every participant receives updates as they happen.',
    icon: MessageSquareText,
  },
  {
    title: 'Session expires',
    description: 'The room lifecycle stays clear and intentional.',
    icon: Clock3,
  },
]

const principles = [
  {
    title: 'Live presence',
    description:
      'Ephemere keeps the room state active so people can see conversation flow without manual refreshes.',
  },
  {
    title: 'Low-friction entry',
    description:
      'A shared link moves users directly into the room, keeping short-lived conversations fast to start.',
  },
  {
    title: 'Temporary by design',
    description:
      'The app focuses on realtime exchange first, then lets rooms age out when the conversation is done.',
  },
]

const RealtimeDiagram = () => {
  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm sm:min-h-[420px] sm:p-8">
      <svg
        viewBox="0 0 520 420"
        className="absolute inset-0 size-full text-[hsl(var(--foreground))]"
        role="img"
        aria-label="Animated realtime communication flow diagram"
      >
        <defs>
          <marker
            id="arrow"
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
          >
            <path d="M0 0L8 4L0 8Z" fill="currentColor" opacity="0.55" />
          </marker>
        </defs>

        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path
            d="M122 148C168 84 240 82 260 176C280 270 352 268 398 206"
            opacity="0.18"
            strokeWidth="1.5"
          />
          <path
            d="M122 272C168 336 240 338 260 244C280 150 352 152 398 214"
            opacity="0.18"
            strokeWidth="1.5"
          />
          <path
            d="M152 210H236"
            markerEnd="url(#arrow)"
            opacity="0.45"
            strokeDasharray="7 7"
            strokeWidth="1.5"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur="1.2s"
              repeatCount="indefinite"
              values="14;0"
            />
          </path>
          <path
            d="M284 210H368"
            markerEnd="url(#arrow)"
            opacity="0.45"
            strokeDasharray="7 7"
            strokeWidth="1.5"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur="1.2s"
              repeatCount="indefinite"
              values="14;0"
            />
          </path>
        </g>

        <g>
          <circle cx="260" cy="210" r="54" fill="currentColor" opacity="0.05" />
          <circle
            cx="260"
            cy="210"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.4"
          />
          <circle
            cx="260"
            cy="210"
            r="74"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0"
          >
            <animate
              attributeName="r"
              dur="2.4s"
              repeatCount="indefinite"
              values="54;92"
            />
            <animate
              attributeName="opacity"
              dur="2.4s"
              repeatCount="indefinite"
              values="0.26;0"
            />
          </circle>
          <text
            x="260"
            y="204"
            fill="currentColor"
            fontSize="15"
            fontWeight="600"
            textAnchor="middle"
          >
            room
          </text>
          <text
            x="260"
            y="225"
            fill="currentColor"
            fontSize="11"
            opacity="0.5"
            textAnchor="middle"
          >
            live state
          </text>
        </g>

        {[
          { x: 110, y: 148, label: 'A' },
          { x: 410, y: 206, label: 'B' },
          { x: 110, y: 272, label: 'C' },
          { x: 410, y: 286, label: 'D' },
        ].map((node, index) => (
          <g key={node.label}>
            <circle
              cx={node.x}
              cy={node.y}
              r="31"
              fill="currentColor"
              opacity="0.04"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="31"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.35"
            />
            <circle cx={node.x} cy={node.y} r="4" fill="currentColor">
              <animate
                attributeName="opacity"
                begin={`${index * 0.25}s`}
                dur="1.8s"
                repeatCount="indefinite"
                values="0.25;1;0.25"
              />
            </circle>
            <text
              x={node.x}
              y={node.y + 52}
              fill="currentColor"
              fontSize="11"
              opacity="0.5"
              textAnchor="middle"
            >
              peer {node.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.82)] px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] backdrop-blur">
        <span>event stream</span>
        <span className="font-mono">24ms</span>
      </div>
    </div>
  )
}

const RealtimeCommunicationSection = () => {
  return (
    <section id="realtime" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl"
      >
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="px-4 sm:px-6 lg:px-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
              <ShieldCheck className="size-3.5" />
              Realtime communication
            </div>

            <h2 className="mt-6 max-w-2xl text-4xl font-medium tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
              Built for conversations that happen now.
            </h2>

            <p className="mt-6 text-base leading-8 text-[hsl(var(--muted-foreground))] sm:text-lg">
              Ephemere makes a temporary room feel immediate: participants join
              through one link, messages move through the room instantly, and
              the session stays intentionally short-lived.
            </p>

            <div className="mt-10 grid gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="flex gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                      <Icon className="size-4 text-[hsl(var(--foreground))]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <RealtimeDiagram />
        </div>

        <div className="mt-8 grid gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:px-0">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
            >
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export default RealtimeCommunicationSection

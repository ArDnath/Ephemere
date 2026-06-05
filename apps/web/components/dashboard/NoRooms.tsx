'use client'

import { Button } from '@ephemere/ui/components/ui/button.tsx'
import Link from 'next/link'

import { UserStats } from '@/types'

import CreateRoomButton from './CreateRoomButton'

const LinePreview = () => {
  return (
    <div className="relative h-32 w-full max-w-md overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] sm:h-40">
      <svg
        viewBox="0 0 520 160"
        className="absolute inset-0 size-full text-[hsl(var(--foreground))]"
        aria-hidden="true"
      >
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path
            d="M40 92H156C184 92 188 54 216 54H480"
            opacity="0.18"
            strokeWidth="1"
          />
          <path
            d="M40 110H178C206 110 210 76 238 76H480"
            opacity="0.12"
            strokeWidth="1"
          />
          <path
            d="M40 74H138C166 74 174 106 204 106H480"
            opacity="0.12"
            strokeWidth="1"
          />
          <path
            d="M40 92H156C184 92 188 54 216 54H480"
            strokeDasharray="18 260"
            strokeWidth="1.5"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur="2.8s"
              repeatCount="indefinite"
              values="278;0"
            />
          </path>
        </g>
        <g fill="currentColor">
          {[64, 196, 320, 456].map((x, index) => (
            <circle key={x} cx={x} cy={index === 1 ? 54 : 92} r="3">
              <animate
                attributeName="opacity"
                begin={`${index * 0.18}s`}
                dur="1.8s"
                repeatCount="indefinite"
                values="0.25;1;0.25"
              />
            </circle>
          ))}
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--background)/0.78)] px-4 py-2 text-xs text-[hsl(var(--muted-foreground))] backdrop-blur">
        Waiting for the first room
      </div>
    </div>
  )
}

export default function NoRooms({ stats }: { stats: UserStats }) {
  return (
    <div className="relative flex min-h-[320px] flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/0.45)] px-4 py-10 md:min-h-[420px] md:gap-7">
      <LinePreview />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] md:text-xl">
          No active rooms found
        </h2>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] md:text-base">
          Start by creating a new room or join an existing one
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 px-4 md:w-auto md:flex-row md:gap-4 md:px-0">
        <Link href="/join-room" className="w-full md:w-auto">
          <Button variant="outline" className="w-full md:w-[120px]">
            Join a Room
          </Button>
        </Link>
        <div className="w-full md:w-auto">
          <CreateRoomButton {...stats} showStats={false} />
        </div>
      </div>
    </div>
  )
}

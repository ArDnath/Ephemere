import { GitBranch, Github } from 'lucide-react'

import BlurFadeIn from '../ui/BlurFadeIn'
import LinkButton from '../ui/LinkButton'

import StripesBox from './StripesBox'

const OpenSourceDiagram = () => {
  return (
    <div className="relative flex h-32 w-full max-w-xs items-center justify-center sm:h-36">
      <svg
        viewBox="0 0 280 140"
        className="absolute inset-0 size-full text-[hsl(var(--foreground))]"
        role="img"
        aria-label="Open source contribution flow"
      >
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path
            d="M54 70H128C148 70 148 36 170 36H226"
            strokeOpacity="0.28"
            strokeWidth="1.5"
          />
          <path
            d="M54 70H128C148 70 148 104 170 104H226"
            strokeOpacity="0.28"
            strokeWidth="1.5"
          />
          <path
            d="M54 70H226"
            strokeDasharray="7 7"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur="1.6s"
              repeatCount="indefinite"
              values="14;0"
            />
          </path>
        </g>

        {[
          { x: 54, y: 70, label: 'repo' },
          { x: 226, y: 36, label: 'fork' },
          { x: 226, y: 104, label: 'merge' },
        ].map((node, index) => (
          <g key={node.label}>
            <circle
              cx={node.x}
              cy={node.y}
              r="18"
              fill="hsl(var(--card))"
              stroke="currentColor"
              strokeOpacity="0.3"
            />
            <circle cx={node.x} cy={node.y} r="4" fill="currentColor">
              <animate
                attributeName="opacity"
                begin={`${index * 0.25}s`}
                dur="1.8s"
                repeatCount="indefinite"
                values="0.35;1;0.35"
              />
            </circle>
            <text
              x={node.x}
              y={node.y + 34}
              fill="currentColor"
              fontSize="10"
              opacity="0.55"
              textAnchor="middle"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <GitBranch className="size-6 text-[hsl(var(--foreground))]" />
      </div>
    </div>
  )
}

const OpenSourceInfo = () => {
  return (
    <StripesBox>
      <div className="flex flex-col items-center space-y-4 p-4 sm:space-y-5 sm:p-6 md:p-8 lg:p-10 xl:px-20">
        <BlurFadeIn delay={0.1} blur={true}>
          <OpenSourceDiagram />
        </BlurFadeIn>

        <BlurFadeIn delay={0.2} blur={true}>
          <h2 className="text-center text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl">
            Open Source Forever
          </h2>
        </BlurFadeIn>

        <BlurFadeIn delay={0.3} blur={true}>
          <p className="px-2 text-center text-sm text-[hsl(var(--muted-foreground))] sm:px-0 sm:text-base">
            Ephemere is built in public. Fork the code, propose changes, and
            help shape the room experience.
          </p>
        </BlurFadeIn>

        <BlurFadeIn delay={0.4} blur={true}>
          <LinkButton
            href="https://github.com/ArDnath"
            className="z-50 text-sm sm:text-base"
          >
            <Github className="mr-2 size-3 sm:size-4" />
            View on GitHub
          </LinkButton>
        </BlurFadeIn>
      </div>
    </StripesBox>
  )
}

export default OpenSourceInfo

'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@ephemere/ui/components/ui/button.tsx'
import DemoChatAnimated from './DemoChatAnimated'

export const Hero = () => {
  // Container tracks the entire scroll sequence
  const containerRef = useRef<HTMLDivElement>(null)

  // Track scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // 1. Move the hero text upwards faster than the viewport scroll initially.
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -120])

  // 2. Map opacity and scale to smoothly fade out the pinned background image
  const imageOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98])

  // 3. 3D Tilt Effect for the Demo Card (FIXED: Changed from -12 to 12 for upward tilt)
  // Tilts the card upwards between 0% and 30% scroll progress
  // Top narrows and bottom stays full width
  const cardRotateX = useTransform(scrollYProgress, [0, 0.3], [0, 12])
  const cardScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.96])

  return (
    // Set a relative container with a controlled min-height
    <div ref={containerRef} className="relative min-h-[140vh]">
      {/* ── Fixed/Sticky Wrapper for the Banner Image ── */}
      <motion.div
        className="sticky top-0 z-0 overflow-hidden"
        style={{
          opacity: imageOpacity,
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
        }}
      >
        <div className="relative h-[28vh] w-full sm:h-[35vh] md:h-[48vh]">
          <Image
            src="/landscape.jpg"
            alt="Feel calm"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* ── Cross-Mode Progressive Blur Mask ── */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-full"
          style={{
            background:
              'linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.98) 15%, hsl(var(--background) / 0.8) 35%, hsl(var(--background) / 0.3) 65%, transparent 100%)',
          }}
        />

        {/* Multi-layered progressive backdrops */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-4/5"
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            maskImage: 'linear-gradient(to top, black 0%, black 15%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, black 15%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maskImage: 'linear-gradient(to top, black 0%, black 25%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, black 25%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            maskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4"
          style={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            maskImage: 'linear-gradient(to top, black 0%, black 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, black 55%, transparent 100%)',
          }}
        />
      </motion.div>

      {/* ── Hero Content Section ── */}
      <motion.div
        style={{ y: heroY, scale: heroScale }}
        className="relative z-10"
      >
        <section
          id="hero"
          className="mx-auto -mt-16 max-w-5xl px-4 sm:-mt-24 sm:px-8 md:-mt-32"
        >
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md"
            >
              <span className="size-1.5 rounded-full bg-[hsl(var(--foreground))]" />
              Ephemere — rooms that disappear
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Real-time chat,{' '}
              <span className="text-foreground/60">no trace left behind.</span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              Create temporary chat rooms instantly. Rooms expire automatically.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full rounded-lg px-6 py-2.5 text-sm font-medium sm:w-auto">
                  Get started
                </Button>
              </Link>
              <Link href="/room/public" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full rounded-lg border-2 bg-background/50 px-6 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm hover:bg-muted sm:w-auto"
                >
                  Join public room
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Demo Graphic with 3D Tilt Illusion ── */}
          <div style={{ perspective: '1200px' }} className="mt-14">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                rotateX: cardRotateX,
                scale: cardScale,
                transformOrigin: 'bottom center' // Keeps the bottom anchored as the top tilts away
              }}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <DemoChatAnimated />
            </motion.div>
          </div>
        </section>
      </motion.div>
    </div>
  )
}

'use client'
import React, { useEffect, useState } from 'react'
import GridPattern from '@ephemere/ui/components/ui/GridPattern.tsx'
import { cn } from '@ephemere/ui/utils'
import { Timer, MoreHorizontal, Send, MessageCircle } from 'lucide-react'
import BlurFadeIn from '../ui/BlurFadeIn'
import ChatMessages from './ChatMessages'

const DemoChatAnimated = () => {
  // Initializing countdown state in seconds (45 minutes = 2700 seconds)
  const [secondsLeft, setSecondsLeft] = useState(2700)
  const [isActive, setIsActive] = useState(true)
  const [messageCount, setMessageCount] = useState(12)

  // Live countdown timer mechanism — runs once, uses functional updater to avoid dep
  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId)
          setIsActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalId)
  }, [])

  // Simulate new messages appearing
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageCount((prev) => Math.min(prev + 1, 20))
    }, 3000)
    return () => clearInterval(messageInterval)
  }, [])

  // Helper function to format seconds into MM:SS format
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // Helper function to determine urgency level
  const getUrgencyLevel = (seconds: number) => {
    if (seconds > 600) return 'healthy' // > 10 mins
    if (seconds > 120) return 'warning' // > 2 mins
    return 'critical' // < 2 mins
  }

  const urgencyLevel = getUrgencyLevel(secondsLeft)

  return (
    <BlurFadeIn
      delay={0.2}
      className="flex justify-center w-full"
      blur={true}
    >
      <div className="relative w-full  overflow-hidden rounded-2xl border border-[hsl(var(--border)/0.5)] bg-gradient-to-br from-[hsl(var(--card))/0.9] via-[hsl(var(--card))/0.8] to-[hsl(var(--card))/0.7] backdrop-blur-xl shadow-xl">
        {/* Ambient glow effect */}
        <div className="absolute inset-0 -z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--foreground)/0.04)] via-transparent to-[hsl(var(--foreground)/0.02)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>

        {/* Header */}
        <div className="relative z-10 border-b border-[hsl(var(--border)/0.3)] bg-gradient-to-r from-[hsl(var(--card))/0.5] to-transparent backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left section: Status + Title */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Status Indicator */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    'h-3 w-3 rounded-full transition-all duration-500',
                    urgencyLevel === 'healthy'
                      ? 'bg-[hsl(var(--foreground))] shadow-lg shadow-black/20'
                      : urgencyLevel === 'warning'
                        ? 'bg-[hsl(var(--muted-foreground))] shadow-lg shadow-black/20 animate-pulse'
                        : 'bg-[hsl(var(--foreground))] shadow-lg shadow-black/20 animate-pulse'
                  )}
                />
                {/* Animated ring */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-full animate-ping opacity-75',
                    urgencyLevel === 'healthy'
                      ? 'bg-[hsl(var(--foreground))]'
                      : urgencyLevel === 'warning'
                        ? 'bg-[hsl(var(--muted-foreground))]'
                        : 'bg-[hsl(var(--foreground))]'
                  )}
                  style={{
                    animation:
                      urgencyLevel === 'critical'
                        ? 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                        : 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}
                />
              </div>

              {/* Title and subtitle */}
              <div className="min-w-0">
                <h2 className="text-sm font-semibold tracking-tight text-[hsl(var(--foreground))] truncate">
                  Ephemeral Space
                </h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                  {isActive ? 'Active now' : 'Room expired'}
                </p>
              </div>
            </div>

            {/* Right section: Timer + Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Timer Badge */}
              <div
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-300 backdrop-blur-sm',
                  urgencyLevel === 'healthy'
                    ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]'
                    : urgencyLevel === 'warning'
                      ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]'
                      : 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))]'
                )}
              >
                <Timer
                  size={14}
                  className={cn(
                    'flex-shrink-0',
                    urgencyLevel === 'healthy'
                      ? 'text-[hsl(var(--foreground))]'
                      : urgencyLevel === 'warning'
                        ? 'text-[hsl(var(--foreground))]'
                        : 'text-[hsl(var(--background))]'
                  )}
                />
                <span className="font-mono tracking-wider">
                  {secondsLeft > 0 ? formatTime(secondsLeft) : '00:00'}
                </span>
              </div>

              {/* Action Menu */}
              <button className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))/0.1] rounded-lg p-2 transition-all duration-200 hover:scale-110">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="relative min-h-[450px] max-h-[600px] overflow-hidden flex flex-col">
          {/* Enhanced Grid Background */}
          <div className="absolute inset-0">
            <GridPattern
              width={32}
              height={32}
              x={-1}
              y={-1}
              className={cn(
                '[mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,white,transparent_85%)]',
                'opacity-[0.08] stroke-[hsl(var(--foreground))] mix-blend-overlay'
              )}
            />
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(var(--card))/0.3]" />
          </div>

          {/* Messages Container */}
          <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-hide">
            <ChatMessages messageCount={messageCount} />
          </div>

          {/* Input Section */}
          <div className="relative z-10 border-t border-[hsl(var(--border)/0.3)] bg-gradient-to-t from-[hsl(var(--card))/0.6] to-transparent backdrop-blur-sm px-6 py-4">
            <div className="flex items-center gap-3">
              {/* Input field */}
              <div className="flex-1 flex items-center gap-2 bg-[hsl(var(--background))/0.4] border border-[hsl(var(--border)/0.3)] rounded-lg px-4 py-2.5 hover:border-[hsl(var(--border)/0.5)] focus-within:border-[hsl(var(--border)/0.7)] transition-colors duration-200 backdrop-blur-sm">
                <MessageCircle size={16} className="text-[hsl(var(--muted-foreground))]" />
                <input
                  type="text"
                  placeholder="Say something ephemeral..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))/0.6] text-[hsl(var(--foreground))]"
                  disabled
                />
              </div>

              {/* Send button */}
              <button
                disabled
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-[hsl(var(--foreground))] hover:opacity-90 text-[hsl(var(--background))] transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
              >
                <Send size={16} />
              </button>
            </div>

            {/* Info text */}
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3 text-center">
              Messages disappear when the room expires
            </p>
          </div>
        </div>

        {/* Corner accent for premium feel */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[hsl(var(--foreground)/0.04)] to-transparent rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[hsl(var(--foreground)/0.03)] to-transparent rounded-full blur-3xl -z-0" />
      </div>
    </BlurFadeIn>
  )
}

export default DemoChatAnimated

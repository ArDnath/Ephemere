'use client'

import { Button } from '@ephemere/ui/components/ui/button.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Link } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'

import { ClockIcon } from '@/components/icons/animated/clock'

import Countdown from './Countdown'

type RoomSettingsProps = {
  roomId: string
  timeLeft: Date
}

export const RoomSettings = ({ roomId, timeLeft }: RoomSettingsProps) => {
  const [copied, setCopied] = useState(false)
  const [fullUrl, setFullUrl] = useState('')
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const pathname = usePathname()

  const animationProps = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
    transition: { duration: 0.1 },
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFullUrl(window.location.origin + pathname)
    }
  }, [pathname])

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        setCopied(true)

        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        const id = setTimeout(() => {
          setCopied(false)
        }, 2000)

        setTimeoutId(id)
      })
      .catch((err) => {
        console.error('Failed to copy: ', err)
      })
  }

  return (
    <div className="chat-scroll paper-shell halftone-shadow relative hidden h-full w-64 flex-col overflow-y-auto border border-white/10 lg:flex">
      <div className="flex h-full flex-col gap-4 p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
            server explorer
          </p>
          <h2 className="font-serif text-3xl font-black leading-none text-white">
            Room
          </h2>
        </div>
        <div className="irregular-sheet flex items-center gap-2 border border-white/10 bg-white/5 p-4">
          <ClockIcon className="size-4 text-sky-200" />
          <div className="font-mono text-sm text-white">
            <Countdown endDate={timeLeft} />
          </div>
        </div>
        <div className="flex-1 border-t border-white/10 pt-4">
          <p className="mb-2 font-serif text-2xl font-black text-white">
            Share Room
          </p>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full rounded-2xl border border-white/10 bg-white/10 py-4 px-3 text-left text-sm font-semibold text-white transition duration-200 hover:bg-white/15"
              onClick={copyToClipboard}
              disabled={copied}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    className="flex w-full items-center justify-between"
                    {...animationProps}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-white">Copied!</span>
                    </div>
                    <Check className="size-4 text-sky-200" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    className="flex w-full items-center justify-between"
                    {...animationProps}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-white">Copy Link</span>
                    </div>
                    <Link className="size-4 text-sky-200" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            <span className="font-mono text-xs text-slate-400">
              Share this link instantly to keep the room flowing.
            </span>
            <div className="flex flex-col items-center gap-3 p-2">
              <div className="size-32 overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-2">
                <QRCodeSVG value={fullUrl} className="size-full" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-400">Scan QR code to join</p>
                <p className="text-xs text-slate-400">Or share this room code</p>
                <p className="font-mono text-sm font-semibold text-white">
                  {roomId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

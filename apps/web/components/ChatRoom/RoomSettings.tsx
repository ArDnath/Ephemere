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
    <div className="chat-scroll paper-shell halftone-shadow relative hidden h-full w-64 flex-col overflow-y-auto border border-[#3e2c1a] lg:flex">
      <div className="flex h-full flex-col gap-4 p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#766247]">
            server explorer
          </p>
          <h2 className="font-serif text-3xl font-black leading-none text-[#291f14]">
            Room
          </h2>
        </div>
        <div className="irregular-sheet flex items-center gap-2 border border-[#3e2c1a]/50 bg-[#f8edcf] p-4">
          <ClockIcon className="size-4" />
          <div className="font-mono text-sm">
            <Countdown endDate={timeLeft} />
          </div>
        </div>
        <div className="flex-1 border-t border-[#3e2c1a]/30 pt-4">
          <p className="mb-2 font-serif text-2xl font-black text-[#291f14]">
            Share Room
          </p>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full rounded-[10px] border border-[#3e2c1a] bg-[#fff6db] py-5 text-[#281d12] shadow-[4px_4px_0_rgba(45,32,19,.12)] hover:bg-[#ffc247]"
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
                      <span className="text-sm font-medium">Copied!</span>
                    </div>
                    <Check className="size-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    className="flex w-full items-center justify-between"
                    {...animationProps}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">Copy Link</span>
                    </div>
                    <Link className="size-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>{' '}
            <span className="font-mono text-xs text-[#6f5b3d]">
              Share this link with others to invite them
            </span>
            <div className="flex flex-col items-center gap-2 p-2">
              <div className="size-32 border border-[#3e2c1a] bg-[#fff6db] p-2">
                <QRCodeSVG value={fullUrl} className="size-full" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-center font-mono text-xs text-[#6f5b3d]">
                  Scan QR Code to join
                </p>
                <p className="text-center font-mono text-xs text-[#8d795a]">
                  Or share the room code:
                </p>
                <p className="font-mono text-sm font-bold text-[#281d12]">
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

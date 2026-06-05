'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy, Link2 } from 'lucide-react'

interface PublicRoomShareProps {
  roomId: string
}

export const PublicRoomShare = ({ roomId }: PublicRoomShareProps) => {
  const [copied, setCopied] = useState(false)

  const roomUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${roomId}`
      : `/room/${roomId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* QR Code */}
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-lg border border-border bg-white p-3">
          <QRCodeSVG
            value={roomUrl}
            size={120}
            bgColor="#ffffff"
            fgColor="#111111"
            level="M"
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Scan to join this room
        </p>
      </div>

      {/* URL copy */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Link2 className="size-3" />
          Room link
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
            {roomUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Copy link"
          >
            {copied ? (
              <Check className="size-3.5 text-foreground" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
        {copied && (
          <p className="text-xs text-foreground animate-fade-in">
            Copied to clipboard!
          </p>
        )}
      </div>
    </div>
  )
}

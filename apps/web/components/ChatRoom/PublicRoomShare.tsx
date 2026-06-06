'use client'

import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy, Link2, QrCode } from 'lucide-react'

interface PublicRoomShareProps {
  roomId: string
}

export const PublicRoomShare = ({ roomId }: PublicRoomShareProps) => {
  const [copied, setCopied] = useState(false)
  const [roomUrl, setRoomUrl] = useState('')
  const qrRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRoomUrl(`${window.location.origin}/room/${roomId}`)
    }
  }, [roomId])

  const handleCopy = async () => {
    if (!roomUrl) return

    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const createQrPng = async () => {
    if (!qrRef.current) return null

    const serializer = new XMLSerializer()
    const svgText = serializer.serializeToString(qrRef.current)
    const svgBlob = new Blob([svgText], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const svgUrl = URL.createObjectURL(svgBlob)

    try {
      const image = new Image()
      image.decoding = 'async'
      image.src = svgUrl

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('Failed to render QR code'))
      })

      const padding = 32
      const size = 512
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')
      if (!context) return null

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, size, size)
      context.drawImage(
        image,
        padding,
        padding,
        size - padding * 2,
        size - padding * 2
      )

      return await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1)
      })
    } finally {
      URL.revokeObjectURL(svgUrl)
    }
  }

  const downloadQr = (blob: Blob) => {
    const imageUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `ephemere-room-${roomId}-qr.png`
    link.click()
    URL.revokeObjectURL(imageUrl)
  }

  const handleShareQr = async () => {
    if (!roomUrl) return

    const blob = await createQrPng()
    if (!blob) return

    const file = new File([blob], `ephemere-room-${roomId}-qr.png`, {
      type: 'image/png',
    })

    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Ephemere room',
          text: 'Scan this QR code to join the room.',
          files: [file],
        })
        return
      } catch {
        // User cancelled native share sheet.
      }
    }

    downloadQr(blob)
  }

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">
            Invite
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">
            Share this room
          </h3>
          <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            Send the link or QR code so others can join instantly.
          </p>
        </div>
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2">
          <Link2 className="size-4 text-[hsl(var(--foreground))]" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="mx-auto flex w-full max-w-[13rem] flex-col items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
          <QRCodeSVG
            ref={qrRef}
            value={roomUrl || '/'}
            size={132}
            bgColor="#ffffff"
            fgColor="#111111"
            level="M"
          />
          <button
            onClick={handleShareQr}
            disabled={!roomUrl}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--secondary))] disabled:opacity-50"
          >
            <QrCode className="size-4" />
            Share QR image
          </button>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2">
            <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
              Join link
            </p>
            <p className="truncate font-mono text-xs text-[hsl(var(--foreground))]">
              {roomUrl || 'Preparing link...'}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleCopy}
              disabled={!roomUrl}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--secondary))] disabled:opacity-50"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>

          {copied && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Link copied to clipboard.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

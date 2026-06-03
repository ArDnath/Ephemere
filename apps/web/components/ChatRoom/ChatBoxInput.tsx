'use client'
import { Button } from '@ephemere/ui/components/ui/button.tsx'
import { Textarea } from '@ephemere/ui/components/ui/textarea.tsx'
import { Send, Sparkles } from 'lucide-react'
import { FormEvent, useState } from 'react'

import FileInput from './FileInput'

const ChatBoxInput = ({
  sendMessage,
}: {
  sendMessage: (content: string, image?: string) => void
}) => {
  const [message, setMessage] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage && !image) return
    setIsSending(true)
    sendMessage(trimmedMessage ?? '', image || undefined)
    setMessage('')
    setImage(null)
    window.setTimeout(() => {
      setIsSending(false)
    }, 700)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`absolute bottom-2 right-1/2 z-50 flex w-[95%] translate-x-1/2 items-center gap-2 rounded-[24px] border border-amber-300/12 bg-black/65 p-2 shadow-[0_30px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl md:bottom-5 md:w-[90%] md:p-3 ${
        isSending ? 'message-sending socket-warp' : ''
      }`}
    >
      <FileInput onImageUpload={setImage} SendImage={image} />
      <Textarea
        id="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
        className="chat-scroll mx-1 max-h-20 min-h-8 w-full flex-1 resize-none overflow-auto border-none bg-transparent font-sans text-sm text-amber-50 shadow-none outline-none ring-0 placeholder:text-amber-100/35 focus-within:outline-none focus-visible:ring-0 md:mx-2 md:text-base"
        placeholder="Type your message... (Shift+Enter for newline)"
      />
      <Button
        type="submit"
        disabled={isSending || (!message.trim() && !image)}
        className="flex-center h-auto rounded-[18px_14px_18px_14px] border border-amber-300/15 bg-amber-300 px-4 py-2 text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-amber-200 md:px-5 md:py-3 disabled:opacity-50"
        aria-label="send message"
      >
        {isSending ? (
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="size-4" />
            sending
            <span className="inline-flex rounded-full bg-slate-900/90 px-2 py-1 font-mono text-[11px] text-white">
              tx
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send size={20} className="size-5 text-slate-950" />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] md:inline">
              send
            </span>
          </span>
        )}
      </Button>
    </form>
  )
}

export default ChatBoxInput

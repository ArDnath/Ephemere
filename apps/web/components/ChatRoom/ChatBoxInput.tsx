'use client'
import { Button } from '@ephemere/ui/components/ui/button.tsx'
import { Textarea } from '@ephemere/ui/components/ui/textarea.tsx'
import { ArrowUp } from 'lucide-react'
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

  const canSend = !isSending && (!!message.trim() || !!image)

  return (
    <form
      onSubmit={handleSubmit}
      className={`absolute bottom-3 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 items-end gap-2 rounded-xl border border-border bg-background/95 p-2 shadow-lg shadow-black/5 backdrop-blur-sm md:bottom-4 ${
        isSending ? 'message-sending' : ''
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
        className="chat-scroll mx-1 max-h-32 min-h-[2.25rem] w-full flex-1 resize-none overflow-auto border-none bg-transparent text-sm text-foreground shadow-none outline-none ring-0 placeholder:text-muted-foreground focus-within:outline-none focus-visible:ring-0"
        placeholder="Message… (Shift+Enter for newline)"
      />

      <Button
        type="submit"
        disabled={!canSend}
        className="flex-shrink-0 size-8 rounded-lg bg-foreground p-0 text-background transition-opacity hover:opacity-80 disabled:opacity-30"
        aria-label="Send message"
      >
        <ArrowUp className="size-4" />
      </Button>
    </form>
  )
}

export default ChatBoxInput

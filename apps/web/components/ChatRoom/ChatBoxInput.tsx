'use client'
import { Button } from '@ephemere/ui/components/ui/button.tsx'
import { Textarea } from '@ephemere/ui/components/ui/textarea.tsx'
import { Send } from 'lucide-react'
import { FormEvent, useState } from 'react'

import FileInput from './FileInput'

const ChatBoxInput = ({
  sendMessage,
}: {
  sendMessage: (content: string, image?: string) => void
}) => {
  const [message, setMessage] = useState('')
  const [image, setImage] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage && !image) return
    sendMessage(trimmedMessage ?? '', image || undefined)
    setMessage('')
    setImage(null)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-2 right-1/2 z-50 flex w-[95%] translate-x-1/2 items-center rounded-[16px_12px_18px_10px] border border-[#3e2c1a] bg-[#fff6db] p-0.5 px-1 shadow-[5px_5px_0_rgba(45,32,19,.14)] md:bottom-5 md:w-[90%] md:p-1 md:px-2"
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
        className="chat-scroll mx-1 max-h-16 min-h-6 w-full flex-1 resize-none overflow-auto border-none bg-transparent text-sm text-[#281d12] shadow-none outline-none ring-0 placeholder:text-[#806c4e] [field-sizing:content] focus-within:outline-none focus-visible:ring-0 md:mx-2 md:max-h-20 md:min-h-7 md:text-base"
        placeholder="Transmit a message"
      />
      <Button
        type="submit"
        className="flex-center h-auto rounded-[12px] bg-[#ffc247] p-2 text-[#281d12] hover:bg-[#ffb323] md:p-[10px]"
        aria-label={'send message'}
      >
        <Send size={24} className="size-8 p-0 md:size-12" />
      </Button>
    </form>
  )
}

export default ChatBoxInput

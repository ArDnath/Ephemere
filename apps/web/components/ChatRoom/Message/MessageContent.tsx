import Image from 'next/image'

import { Reaction } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@ephemere/ui/components/ui/dialog.tsx'

import { EmojiPickerPopover } from '../EmojiPickerPopover'

import { MessageReactions } from './MessageReactions'

type MessageContentProps = {
  message?: string
  userEmoji?: string
  image?: string
  isOwnMessage: boolean
  isPrevMessageSameSender: boolean
  onReaction: (emoji: string, currentEmoji?: string) => void
  reactions: Reaction[]
  totalReactions: number
}

export const MessageContent = ({
  message,
  image,
  userEmoji,
  isOwnMessage,
  isPrevMessageSameSender,
  onReaction,
  reactions,
  totalReactions,
}: MessageContentProps) => {
  return (
    <div
      className={`group flex w-full items-center gap-2 md:gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`${image ? 'w-60 md:w-80' : 'max-w-[70%]'} relative`}>
        <div
          className={`irregular-sheet card-stack noise-overlay flex w-full min-w-16 flex-col items-center justify-start overflow-hidden text-ellipsis text-wrap text-start md:min-w-20 ${
            isPrevMessageSameSender
              ? ''
              : `${isOwnMessage ? 'rounded-tr-[14px]' : 'rounded-tl-[14px]'}`
          } p-2 md:p-3 ${
            isOwnMessage
              ? 'border border-amber-300/18 bg-[linear-gradient(135deg,rgba(104,72,26,0.72),rgba(65,43,20,0.88))] text-amber-50'
              : 'border border-amber-100/10 bg-[linear-gradient(135deg,rgba(43,35,23,0.92),rgba(29,23,16,0.88))] text-amber-50'
          }`}
        >
          {image && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="mt-1 cursor-pointer rounded-[18px_14px_18px_14px] border border-amber-200/10 bg-black/30 p-1 transition duration-300 hover:border-amber-200/25 hover:bg-black/40 md:mt-2">
                  <Image
                    src={image}
                    alt="Message attachment"
                    className="w-60 rounded-[16px_12px_16px_12px] bg-slate-950 object-contain transition-opacity hover:opacity-90 md:w-80"
                    width={320}
                    height={320}
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
                <div className="relative flex aspect-auto h-[80vh] w-full items-center justify-center">
                  <Image
                    src={image}
                    alt="Enlarged attachment"
                    className="object-contain"
                    fill
                    sizes="100vw"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          {message && (
            <p className="body-sans max-w-[48ch] break-words text-sm leading-7 text-amber-50/95 md:text-base">
              {message}
            </p>
          )}
        </div>
        <MessageReactions
          reactions={reactions}
          totalReactions={totalReactions}
          side={isOwnMessage ? 'left' : 'right'}
        />
      </div>

      <div className="relative">
        <EmojiPickerPopover
          userEmoji={userEmoji}
          onEmojiSelect={onReaction}
          side={isOwnMessage ? 'left' : 'right'}
        />
      </div>
    </div>
  )
}

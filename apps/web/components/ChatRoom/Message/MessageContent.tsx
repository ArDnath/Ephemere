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
      className={`group flex w-full items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`${image ? 'w-60 md:w-72' : 'max-w-[70%]'} relative`}>
        <div
          className={`flex w-full min-w-12 flex-col items-start overflow-hidden text-ellipsis text-wrap px-3 py-2 text-sm leading-relaxed ${
            isPrevMessageSameSender
              ? ''
              : isOwnMessage
                ? 'rounded-tl-xl rounded-bl-xl rounded-br-xl rounded-tr-[4px]'
                : 'rounded-tr-xl rounded-bl-xl rounded-br-xl rounded-tl-[4px]'
          } ${
            isOwnMessage
              ? 'rounded-xl bg-foreground text-background'
              : 'rounded-xl border border-border bg-muted text-foreground'
          } ${totalReactions > 0 ? 'mb-5' : ''}`}
        >
          {image && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90">
                  <Image
                    src={image}
                    alt="Message attachment"
                    className="w-60 rounded-lg bg-muted object-contain md:w-72"
                    width={288}
                    height={288}
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
            <p className="max-w-[52ch] break-words">
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

      <div className="relative opacity-0 transition-opacity group-hover:opacity-100">
        <EmojiPickerPopover
          userEmoji={userEmoji}
          onEmojiSelect={onReaction}
          side={isOwnMessage ? 'left' : 'right'}
        />
      </div>
    </div>
  )
}

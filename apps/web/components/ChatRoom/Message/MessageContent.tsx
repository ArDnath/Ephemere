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
          className={`irregular-sheet flex w-full min-w-16 flex-col items-center justify-start overflow-hidden text-ellipsis text-wrap text-start md:min-w-20 ${
            isPrevMessageSameSender
              ? ''
              : `${isOwnMessage ? 'rounded-tr-[4px]' : 'rounded-tl-[4px]'}`
          } p-1.5 px-3 md:p-2 md:px-4 ${
            isOwnMessage
              ? 'border-[1.5px] border-[#2f8159] bg-[#d8eccd]'
              : 'border-[1.5px] border-[#3e2c1a]/55 bg-[#fff6db]'
          }`}
        >
          {image && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="mt-1 cursor-pointer md:mt-2">
                  <Image
                    src={image}
                    alt="Message attachment"
                    className="w-60 rounded-lg bg-white object-contain transition-opacity hover:opacity-90 md:w-80"
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
            <p className="max-w-[48ch] break-words text-xs md:text-sm">
              {message}
            </p>
          )}
        </div>{' '}
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

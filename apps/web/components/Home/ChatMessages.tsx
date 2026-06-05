'use client'

import { cn } from '@ephemere/ui/utils'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import React, { useRef } from 'react'

type MessageProps = {
  content: string
  isSent: boolean
  delay: number
  avatar: string
  reactions?: string[]
}

const Message = ({
  content,
  isSent,
  delay,
  avatar,
  reactions,
}: MessageProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div className="mb-3.5 flex items-end gap-2 px-1 md:px-3" ref={ref}>
      {isInView && (
        <>
          {/* Avatar Left */}
          {!isSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay }}
              className="size-6 shrink-0 overflow-hidden rounded-full border border-[hsl(var(--border)/0.4)]"
            >
              <Image
                src={avatar}
                alt="User Avatar"
                width={24}
                height={24}
                className="size-full object-cover"
              />
            </motion.div>
          )}

          {/* Chat Bubble */}
          <div className="relative flex flex-col w-full">
            <motion.div
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.35, delay }}
              className={cn(
                'w-fit max-w-[80%] rounded-xl px-3 py-1.5 text-[11px] md:text-xs font-medium tracking-tight shadow-2xs',
                isSent
                  ? 'ml-auto rounded-br-none bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--foreground))] border border-[hsl(var(--primary)/0.08)]'
                  : 'rounded-bl-none border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--secondary)/0.25)] text-[hsl(var(--foreground))]'
              )}
            >
              {content}
            </motion.div>

            {/* Micro Reaction Badge */}
            {reactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.25,
                  delay: delay + 0.4,
                  type: 'spring',
                  stiffness: 160,
                  damping: 12,
                }}
                className={cn(
                  "absolute -bottom-3 flex items-center justify-center gap-0.5 rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] px-1 py-0.5 shadow-2xs select-none",
                  isSent ? "right-2" : "left-2"
                )}
              >
                {reactions.map((reaction, index) => (
                  <span key={index} className="text-[9px] md:text-[10px]">
                    {reaction}
                  </span>
                ))}
              </motion.div>
            )}
          </div>

          {/* Avatar Right */}
          {isSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay }}
              className="size-6 shrink-0 overflow-hidden rounded-full border border-[hsl(var(--border)/0.4)]"
            >
              <Image
                src={avatar}
                alt="Your Avatar"
                width={24}
                height={24}
                className="size-full object-cover"
              />
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

const messages = [
  {
    content: "Wait, this whole room just self-destructs at zero?",
    isSent: false,
    avatar: '/images/RohitSinghRawat.jpg',
  },
  {
    content: "Yep. Total wipe. Zero logs, zero digital footprint.",
    isSent: true,
    avatar: '/images/eren.jpg',
  },
  {
    content: "No tech debt, no receipts. That's heavy.",
    isSent: false,
    avatar: '/images/RohitSinghRawat.jpg',
    reactions: ['🔥', '⚡'],
  },
  {
    content: "Right? It forced you to stay in the moment. Ephemere hits different.",
    isSent: true,
    avatar: '/images/eren.jpg',
  },
  {
    content: "Clean UI too. Pure ghost mode.",
    isSent: false,
    avatar: '/images/RohitSinghRawat.jpg',
    reactions: ['💯'],
  },
  {
    content: "Speak fast, we've got 45 minutes before it's dust.",
    isSent: true,
    avatar: '/images/eren.jpg',
  },
]

const ChatMessages = ({ messageCount = messages.length }: { messageCount?: number }) => {
  return (
    <div className="relative z-10 flex flex-col gap-0.5">
      {messages.slice(0, messageCount).map((message, index) => (
        <Message
          key={index}
          content={message.content}
          isSent={message.isSent}
          avatar={message.avatar}
          delay={index * 0.9 + 0.3} // Sped up dialogue cadence
          reactions={message.reactions}
        />
      ))}
    </div>
  )
}

export default ChatMessages

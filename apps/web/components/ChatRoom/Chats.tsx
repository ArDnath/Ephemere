import { AnimatePresence, motion } from 'framer-motion'

import useChatScroll from '@/hooks/useChatScroll'
import { Message } from '@/types'

import MessageBox from './MessageBox'

type Props = {
  messages: Message[]
  sendReaction: (
    messageId: string,
    emoji: string,
    currentEmoji?: string
  ) => void
}

const Chats = ({ messages, sendReaction }: Props) => {
  const ref = useChatScroll(messages)

  return (
    <div
      className="chat-scroll z-40 flex h-full flex-col overflow-y-auto scroll-smooth py-4"
      ref={ref}
    >
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full md:w-auto"
          >
            <MessageBox
              reactions={message.reactions}
              sendReaction={sendReaction}
              prevMessageSender={
                index > 0 ? messages[index - 1]?.userId : undefined
              }
              userName={message.username}
              messageId={message.id}
              userId={message.userId}
              avatar={message.avatar}
              timestamp={message.sentAt}
              message={message.content}
              image={message.image}
              userEmoji={message.userEmoji}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default Chats

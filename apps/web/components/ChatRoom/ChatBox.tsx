import { Message } from '@/types'

import ChatBoxInput from './ChatBoxInput'
import Chats from './Chats'

interface ChatBoxProps {
  messages: Message[]
  sendMessage: (content: string, image?: string) => void
  sendReaction: (
    messageId: string,
    emoji: string,
    currentEmoji?: string
  ) => void
}

const ChatBox = ({ messages, sendMessage, sendReaction }: ChatBoxProps) => {
  return (
    <div className="paper-shell halftone-shadow relative size-full flex-1 overflow-x-hidden border border-[#3e2c1a] p-2 md:p-4">
      <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(70,47,25,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(70,47,25,.05)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="relative h-[calc(100%-10px)] flex-1 overflow-hidden pb-12 md:h-[calc(100%-16px)] md:pb-16">
        <Chats
          sendReaction={sendReaction}
          messages={messages.map((message) => ({
            id: message.id,
            image: message?.image,
            reactions: message.reactions,
            username: message.username,
            avatar: message.avatar,
            sentAt: message.sentAt,
            content: message.content,
            userEmoji: message.userEmoji,
            userId: message.userId,
          }))}
        />
      </div>
      <ChatBoxInput sendMessage={sendMessage} />
    </div>
  )
}

export default ChatBox

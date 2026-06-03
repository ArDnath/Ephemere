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
    <div className="paper-shell noise-overlay halftone-shadow relative flex size-full min-h-0 flex-1 flex-col overflow-hidden border border-amber-900/25 p-2 md:p-4">
      <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,208,117,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,208,117,.04)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="relative min-h-0 flex-1 overflow-hidden pb-20 md:pb-24">
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

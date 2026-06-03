import { Dot } from 'lucide-react'

type MessageHeaderProps = {
  isOwnMessage: boolean
  userName: string
  timestamp: Date
}

export const MessageHeader = ({
  isOwnMessage,
  userName,
  timestamp,
}: MessageHeaderProps) => {
  return (
    <div className="mb-2 flex items-center gap-2 text-amber-50/90">
      <span className="font-sans text-sm font-semibold tracking-tight">
        {isOwnMessage ? 'You' : userName}
      </span>
      <Dot className="w-4 scale-110 text-amber-300/50" />
      <span className="font-mono text-[10px] text-amber-100/50">
        {new Date(timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  )
}

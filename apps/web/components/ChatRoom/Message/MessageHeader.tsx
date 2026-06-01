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
    <div className="flex items-center justify-center">
      <span className="text-xs font-semibold text-[#2c2115]">
        {isOwnMessage ? 'You' : userName}
      </span>
      <Dot className="w-4 scale-110 text-[#8a7554]" />
      <span className="font-mono text-[10px] text-[#6f5b3d]">
        {new Date(timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  )
}

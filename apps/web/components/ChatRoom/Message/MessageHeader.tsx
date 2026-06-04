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
    <div className={`mb-1 flex items-center gap-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      <span className="text-xs font-semibold text-foreground">
        {isOwnMessage ? 'You' : userName}
      </span>
      <Dot className="size-3.5 text-muted-foreground/50" />
      <span className="font-mono text-[10px] text-muted-foreground">
        {new Date(timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  )
}

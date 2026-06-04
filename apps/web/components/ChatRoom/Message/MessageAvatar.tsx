import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@ephemere/ui/components/ui/avatar.tsx'
import { LoadingSpinner } from '@ephemere/ui/icons/spinner.tsx'

type MessageAvatarProps = {
  avatar: string
  userName: string
  showAvatar: boolean
}

export const MessageAvatar = ({
  avatar,
  userName,
  showAvatar,
}: MessageAvatarProps) => {
  if (!showAvatar) {
    return <div className="size-8 md:size-8" />
  }

  return (
    <Avatar className="size-8 rounded-full border border-border bg-muted">
      <AvatarImage src={avatar} alt={`${userName}'s avatar`} />
      <AvatarFallback>
        <LoadingSpinner className="size-4 md:size-5 text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  )
}

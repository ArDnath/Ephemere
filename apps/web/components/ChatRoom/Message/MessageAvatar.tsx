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
    <Avatar className="size-8 rounded-full border border-amber-300/15 bg-black/25 shadow-[0_12px_26px_rgba(0,0,0,0.3)]">
      <AvatarImage src={avatar} alt={`${userName}'s avatar`} />
      <AvatarFallback>
        <LoadingSpinner className="size-4 md:size-5 text-amber-100/70" />
      </AvatarFallback>
    </Avatar>
  )
}

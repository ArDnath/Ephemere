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
    <Avatar className="size-8 border border-[#3e2c1a] shadow-[3px_3px_0_rgba(45,32,19,.16)]">
      <AvatarImage src={avatar} alt={`${userName}'s avatar`} />
      <AvatarFallback>
        <LoadingSpinner className="size-4 md:size-5" />
      </AvatarFallback>
    </Avatar>
  )
}

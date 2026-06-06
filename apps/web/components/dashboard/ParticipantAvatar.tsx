'use client'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@ephemere/ui/components/ui/avatar.tsx'

import FilledUser from '../icons/FilledUser'

export const ParticipantAvatar = ({
  participant,
}: {
  participant: { name: string; avatar: string }
}) => (
  <Avatar className="border-background size-6 border-2 md:size-8">
    <AvatarImage src={participant.avatar} alt={`${participant.name}'s avatar`} />
    <AvatarFallback className="bg-[hsl(var(--muted))] font-medium text-[hsl(var(--foreground))]">
      <FilledUser className="size-5 fill-black/70 stroke-black/80" />
    </AvatarFallback>
  </Avatar>
)

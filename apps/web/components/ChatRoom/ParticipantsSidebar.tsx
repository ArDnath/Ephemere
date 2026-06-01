import NumberFlow from '@number-flow/react'
import Image from 'next/image'

import { useIdentityStore } from '@/lib/store/useIdentityStore'
import { UserIdentity } from '@/types'

import { UsersIcon } from '../icons/animated/users'

interface ParticipantsSidebarProps {
  participants: UserIdentity[]
}

export const ParticipantsSidebar = ({
  participants,
}: ParticipantsSidebarProps) => {
  const { userId } = useIdentityStore()

  return (
    <div className="chat-scroll paper-shell halftone-shadow relative size-full max-w-[256px] overflow-y-auto border border-[#3e2c1a] max-md:hidden sm:w-64">
      <div className="flex flex-col p-2 lg:p-4">
        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#766247]">
            channel explorer
          </p>
          <h2 className="font-serif text-3xl font-black leading-none text-[#291f14]">
            Nodes
          </h2>
        </div>
        <div className="mb-2 flex items-center justify-between border-y border-[#3e2c1a]/30 py-2 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <UsersIcon className="size-3 sm:size-4 lg:size-5" />
            <h3 className="font-mono text-2xs uppercase tracking-[0.14em] sm:text-xs lg:text-sm">
              Participants
            </h3>
          </div>
          <div className="flex items-center">
            <span className="font-mono text-2xs text-[#6f5b3d] sm:text-xs lg:text-sm">
              <NumberFlow value={participants.length} />
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:gap-2">
          {participants
            .sort((a, b) =>
              a.userId === userId ? -1 : b.userId === userId ? 1 : 0
            )
            .map((user, index) => (
              <div
                key={index}
                className={`irregular-sheet flex items-center justify-between border p-1 transition-all duration-300 ease-in-out sm:p-1.5 lg:p-2 ${
                  user.userId === userId
                    ? 'border-[#279f68] bg-[#c5e8bf] hover:bg-[#b3e3aa]'
                    : 'border-[#3e2c1a]/35 bg-[#f8edcf] hover:bg-[#fff5d8]'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    className="size-6 rounded-full border border-[#3e2c1a] object-cover sm:size-7 lg:size-10"
                    width={40}
                    height={40}
                  />
                  <div className="flex flex-col">
                    <span className="truncate text-2xs font-semibold text-[#281d12] sm:text-xs lg:text-sm">
                      {user.userId === userId
                        ? `${user.username} (You)`
                        : user.username}
                    </span>
                    <span className="font-mono text-[9px] uppercase text-[#6f5b3d]">
                      {user.userId.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

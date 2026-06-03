import { LoadingSpinner } from '@ephemere/ui/icons/spinner.tsx'
import { AudioLines } from 'lucide-react'

import { UserButton } from '@/components/ChatRoom/UserButton'
import EphemereLogo from '@/components/icons/animated/EphemereLogo'
import { LogoutIcon } from '@/components/icons/LogoutIcon'
import { Button } from '@/components/shared/Button'
import { useUser } from '@/hooks/useSession'

import Countdown from './Countdown'

export const RoomHeader = ({
  roomName,
  timeLeft,
  handleExit,
}: {
  roomName: string
  handleExit: () => void
  timeLeft: Date
}) => {
  const { data, isLoading } = useUser()

  // Desktop view
  const DesktopHeader = () => (
    <div className="mb-4 hidden w-full items-center justify-between gap-5 rounded-[28px] border border-white/10 bg-black/50 px-4 py-4 shadow-[0_28px_60px_rgba(0,0,0,0.25)] md:flex">
      <div className="flex items-center gap-4">
        <EphemereLogo />
        {isLoading ? (
          <div className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2">
            <LoadingSpinner className="size-4 text-white/80" />
          </div>
        ) : (
          <UserButton
            user={
              data?.user
                ? {
                    avatar: data.user.image,
                    email: data.user.email,
                    name: data.user.email,
                    isPro: data.user.subscription?.isPro ?? false,
                  }
                : undefined
            }
          />
        )}
      </div>
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
          active channel
        </p>
        <h1 className="font-serif text-4xl font-black leading-none text-white">
          {roomName}
        </h1>
      </div>
      <Button
        className="group rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-white/15"
        onClick={handleExit}
      >
        Leave{' '}
        <LogoutIcon
          size={16}
          className="transition-ease ml-1 opacity-70 group-hover:scale-105 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Button>
    </div>
  )

  const MobileHeader = () => (
    <div className="mb-2 flex w-full items-center justify-between rounded-[24px] border border-white/10 bg-black/50 px-3 py-3 md:hidden">
      <div className="flex items-center gap-3">
        <Button className="size-8 rounded-full bg-white/10 text-white hover:bg-white/15">
          <AudioLines className="size-10 text-white" />
        </Button>
      </div>
      <h1 className="max-w-[150px] truncate px-2 font-serif text-2xl font-black text-white">
        {roomName}
      </h1>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Countdown endDate={timeLeft} />
        </div>
        <Button
          className="flex-center group size-8 rounded-full bg-white/10 p-2 text-white hover:bg-white/15"
          onClick={handleExit}
        >
          <LogoutIcon
            size={14}
            className="transition-ease opacity-70 group-hover:scale-105 group-hover:opacity-100"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <DesktopHeader />
      <MobileHeader />
    </>
  )
}

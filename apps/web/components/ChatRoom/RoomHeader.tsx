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
    <div className="mb-4 hidden w-full items-center justify-between gap-5 md:flex">
      <div className="flex items-center justify-between gap-5">
        <EphemereLogo />
        {isLoading ? (
          <div className="flex items-center justify-center border border-[#3e2c1a] bg-[#f7edcf] p-1">
            <LoadingSpinner className="size-4 -translate-x-px text-[#3e2c1a]" />
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
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#766247]">
          active channel
        </p>
        <h1 className="font-serif text-4xl font-black leading-none text-[#291f14]">
          {roomName}
        </h1>
      </div>
      <Button
        className="group rounded-[10px] border border-[#3e2c1a] bg-[#f8edcf] text-[#281d12] shadow-[4px_4px_0_rgba(45,32,19,.14)] hover:bg-[#ffc247]"
        onClick={handleExit}
      >
        Leave{' '}
        <LogoutIcon
          size={16}
          className="transition-ease -me-1 opacity-60 group-hover:scale-105 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Button>
    </div>
  )

  const MobileHeader = () => (
    <div className="mb-2 flex w-full items-center justify-between px-2 md:hidden">
      <div className="flex items-center gap-4">
        <Button className="size-8 rounded-full">
          <AudioLines className="size-10 invert-0" />
        </Button>
      </div>
      <h1 className="max-w-[150px] truncate px-2 font-serif text-2xl font-black text-[#291f14]">
        {roomName}
      </h1>
      <div className="flex-center gap-5">
        <div className="flex-center h-8 w-24 rounded-2xl border-2 border-black">
          <Countdown endDate={timeLeft} />
        </div>
        <Button
          className="flex-center group size-8 rounded-full p-2"
          onClick={handleExit}
        >
          <LogoutIcon
            size={14}
            className="transition-ease -translate-x-px opacity-60 group-hover:scale-105 group-hover:opacity-100 max-md:size-4"
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

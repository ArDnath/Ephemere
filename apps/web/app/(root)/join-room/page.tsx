import EphemereLogo from '@/components/icons/animated/EphemereLogo'
import { JoinRoomForm } from '@/components/Join-Room/JoinRoomForm'

export const metadata = {
  title: 'Join Room',
  description: 'Join an existing chat room',
}

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ roomId: string; anonymous: string }>
}) => {
  const { roomId, anonymous } = await searchParams
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-[hsl(var(--background))] bg-[repeating-linear-gradient(115deg,hsl(var(--border)/0.55)_0_1px,transparent_1px_7px)] text-[hsl(var(--foreground))]">
      <div className="my-14">
        <EphemereLogo />
      </div>
      <div className="flex flex-col items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.94)] p-6 shadow-sm backdrop-blur sm:p-10">
        <JoinRoomForm anonymous={anonymous == 'true'} roomId={roomId} />
      </div>
    </div>
  )
}

export default Page

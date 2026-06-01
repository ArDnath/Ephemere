import { Button } from '@ephemere/ui/components/ui/button.tsx'
import Link from 'next/link'

import CreateRoomButton from '@/components/dashboard/CreateRoomButton'
import DisplaySwitch from '@/components/dashboard/DisplayRadio'
import DisplayRooms from '@/components/dashboard/DisplayRooms'
import SearchBar from '@/components/dashboard/SearchBar'
import { getRooms } from '@/lib/actions/RoomActions'
import { getUserStats } from '@/lib/actions/UserActions'

export const metadata = {
  title: 'Dashboard',
  description: 'View and manage your chat rooms',
}

export default async function Page(props: {
  searchParams?: Promise<{
    search?: string
  }>
}) {
  const searchParams = await props.searchParams
  const search = searchParams?.search ?? ''

  await new Promise((resolve) => setTimeout(resolve, 0))

  const [rooms, stats] = await Promise.all([
    getRooms({ search }),
    getUserStats(),
  ])

  return (
    <div className="relative min-h-screen w-full p-4 md:p-6 lg:p-10 overflow-hidden">
      {/* Immersive Functional 3D Element Anchor */}
      <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-[600px] w-[600px] opacity-70 mix-blend-multiply md:h-[800px] md:w-[800px]">
         <iframe src="https://my.spline.design/retrocomputer-7d43232cf1639d4cc7eefcfec297f62c/" frameBorder="0" width="100%" height="100%" className="pointer-events-auto"></iframe>
      </div>

      <div className="mb-12 mt-8 md:mt-24 lg:mb-20">
        <h1 className="font-serif text-6xl font-black uppercase leading-[0.85] tracking-tighter text-foreground md:text-8xl lg:text-[9rem]">
          Work<br/>space<span className="font-script text-primary lowercase tracking-normal md:-ml-8 -ml-4">.raw</span>
        </h1>
        <p className="mt-6 max-w-lg font-mono text-sm uppercase tracking-wider text-muted-foreground md:text-base border-l-4 border-primary pl-4 bg-foreground/5 p-2 shadow-halftone">
          // ACCESS GRANTED. INITIALIZE TEMPORARY COMM CHANNELS. MAINTAIN TACTILE CONNECTION.
        </p>
      </div>

      <div className="my-8 flex flex-col items-start justify-between gap-6 lg:my-12 lg:flex-row lg:items-center lg:gap-0 bg-card border-2 border-foreground p-4 shadow-brutal rounded-tl-[40px] rounded-br-[40px] rounded-tr-md rounded-bl-md z-10 relative">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
          <SearchBar search={search} />
          <DisplaySwitch />
        </div>
        <div className="flex w-full items-center gap-4 md:w-auto font-sans">
          <Link href="/join-room" className="w-full md:w-auto">
            <Button className="w-full md:w-auto border-2 border-foreground bg-secondary text-secondary-foreground shadow-brutal transition-transform hover:-translate-y-1 hover:shadow-brutal-lg">
              Join a Room
            </Button>
          </Link>
          <div className="w-full md:w-auto font-sans">
            <CreateRoomButton {...stats} />
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <DisplayRooms rooms={rooms} stats={stats} />
      </div>
    </div>
  )
}

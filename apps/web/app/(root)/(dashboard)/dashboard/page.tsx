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
    <div className="min-h-screen w-full bg-background px-4 py-8 md:px-8 lg:px-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Rooms
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create or join temporary chat rooms. Rooms expire automatically.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar search={search} />
          <DisplaySwitch />
        </div>
        <div className="flex w-full flex-shrink-0 items-center gap-3 sm:w-auto">
          <Link href="/join-room" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-border text-foreground hover:bg-muted"
            >
              Join a Room
            </Button>
          </Link>
          <div className="w-full sm:w-auto">
            <CreateRoomButton {...stats} />
          </div>
        </div>
      </div>

      {/* Room grid */}
      <DisplayRooms rooms={rooms} stats={stats} />
    </div>
  )
}

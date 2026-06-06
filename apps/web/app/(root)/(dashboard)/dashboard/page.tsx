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

  const [rooms, stats] = await Promise.all([
    getRooms({ search }),
    getUserStats(),
  ])

  return (
    <div className="min-h-screen w-full bg-[hsl(var(--background))] px-4 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
      <div className="mb-8 border-b border-[hsl(var(--border))] pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))] md:text-3xl">
          Rooms
        </h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          Create or join temporary chat rooms. Rooms expire automatically.
        </p>
      </div>

      <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 sm:flex-row sm:items-center">
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

      <DisplayRooms rooms={rooms} stats={stats} />
      </div>
    </div>
  )
}

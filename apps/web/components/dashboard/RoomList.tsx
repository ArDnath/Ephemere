'use client'

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@ephemere/ui/components/ui/table.tsx'

import { RoomWithParticipants } from '@/types'

import RoomListRow from './RoomListRow'

const RoomList = ({ rooms }: { rooms: RoomWithParticipants[] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[hsl(var(--border))]">
          <TableCell className="py-3 pl-4 text-xs font-medium uppercase text-[hsl(var(--muted-foreground))] md:pl-6">
            Room
          </TableCell>
          <TableCell className="hidden py-3 text-xs font-medium uppercase text-[hsl(var(--muted-foreground))] md:table-cell">
            Participants
          </TableCell>
          <TableCell className="table-cell py-3 pl-12 text-xs font-medium uppercase text-[hsl(var(--muted-foreground))]">
            Stats
          </TableCell>
          <TableCell className="py-3 pr-4 text-right text-xs font-medium uppercase text-[hsl(var(--muted-foreground))] md:pr-6">
            Actions
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <RoomListRow
            key={room.id}
            id={room.id}
            title={room.name}
            knownParticipants={room.participants
              .filter((p) => p.user)
              .map((p) => ({
                name: p.user!.name,
                avatar: p.user!.image,
              }))}
            totalParticipants={room.participants.length}
            messageCount={room._count.messages}
            closedAt={new Date(room.closedAt)}
            onJoin={() => (window.location.href = `/room/${room.id}`)}
          />
        ))}
      </TableBody>
    </Table>
  )
}

export default RoomList

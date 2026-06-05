'use client'
import { Input } from '@ephemere/ui/components/ui/input.tsx'
import { Label } from '@ephemere/ui/components/ui/label.tsx'
import { Hash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import EphemereRoom from '@/components/icons/EphemereRoom'
import IdentityToggler from '@/components/Join-Room/IdentityToggler'
import { useIdentityStore } from '@/lib/store/useIdentityStore'

import { Button } from '../shared/Button'

export const JoinRoomForm = ({
  roomId,
  anonymous,
}: {
  roomId?: string
  anonymous?: boolean
}) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    roomId: roomId,
  })

  const { setAnonymous } = useIdentityStore()
  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push(`/room/${formData.roomId}`)
  }
  return (
    <form
      onSubmit={submitForm}
      className="flex flex-col items-center max-md:my-3"
    >
      <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 shadow-sm">
        <EphemereRoom className="size-5" />
      </div>
      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
          Join a room
        </h1>
      </div>

      <div className="mb-6 w-full max-w-sm space-y-2">
        <Label htmlFor="room-id">Room ID</Label>
        <div className="relative">
          <Input
            id="room-id"
            onChange={(e) =>
              setFormData((data) => ({ ...data, roomId: e.target.value }))
            }
            className="peer border-[hsl(var(--border))] bg-[hsl(var(--background))] ps-9 text-[hsl(var(--foreground))]"
            value={formData.roomId ?? ''}
            placeholder="Enter room ID"
            type="text"
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
            <Hash size={16} strokeWidth={2} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <IdentityToggler
          defaultChecked={anonymous ?? false}
          onChange={(anonymous) => setAnonymous(anonymous)}
        />
      </div>

      <Button className="w-full" type="submit">
        Join Room
      </Button>
    </form>
  )
}

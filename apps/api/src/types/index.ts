export interface JWTPayload {
  userId: string
  email: string
  isPro: boolean
}

export interface RoomParticipant {
  id: string
  tempUsername: string | null
  tempUserId: string | null
  joinedAt: Date
  leftAt: Date | null
  user: {
    id: string
    name: string
    email: string
    image: string
  } | null
}

export type RoomWithParticipants = {
  id: string
  name: string
  isTemporary: boolean
  maxTimeLimit: number
  maxUsers: number
  createdById: string
  _count: {
    messages: number
  }
  participants: RoomParticipant[]
  updatedAt: Date
  closedAt: Date
  createdAt: Date
}

export type UserWithRooms = {
  id: string
  rooms: RoomWithParticipants[]
  RoomParticipant: {
    room: RoomWithParticipants
  }[]
}

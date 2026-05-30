import { z } from 'zod'

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Room name too long'),
  isTemporary: z.boolean().default(true),
  maxTimeLimit: z
    .number()
    .int()
    .min(1, 'Time limit must be at least 1 minute')
    .max(1440, 'Time limit cannot exceed 24 hours'),
  maxUsers: z
    .number()
    .int()
    .min(2, 'Room must allow at least 2 users')
    .max(200, 'Maximum 200 users allowed'),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>

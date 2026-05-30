import { z } from 'zod'

export const updateProfileSchema = z
  .object({
    name: z.string().min(1, 'Name cannot be empty').max(100, 'Name too long').optional(),
    image: z.string().url('Must be a valid URL').optional(),
  })
  .refine((data) => data.name !== undefined || data.image !== undefined, {
    message: 'At least one field (name or image) must be provided',
  })

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

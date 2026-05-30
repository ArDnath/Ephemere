import { z } from 'zod'

export const uploadFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().min(1, 'Content type is required'),
  isTemporary: z.boolean().optional().default(false),
  expiryTime: z.number().int().positive().optional(),
  roomId: z.string().optional(),
})

export const deleteFileSchema = z.object({
  key: z.string().min(1, 'File key is required'),
})

export type UploadFileInput = z.infer<typeof uploadFileSchema>
export type DeleteFileInput = z.infer<typeof deleteFileSchema>

import { Context } from 'hono'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getR2Client } from '@/utils/StorageClient'
import { uploadFileSchema, deleteFileSchema } from '@ephemere/lib'

export const uploadFile = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = uploadFileSchema.safeParse(body)

    if (!result.success) {
      return c.json(
        { message: 'Invalid request body', errors: result.error.errors },
        400
      )
    }

    const { filename, contentType, roomId, isTemporary } = result.data

    const key = `uploads/${roomId ? `${roomId}/` : ''}${Date.now()}-${filename}`

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME ?? '',
      Key: key,
      ContentType: contentType,
      // Note: Cloudflare R2 does not support object tagging in the same way as S3, 
      // but it accepts standard PUT params. We omit Tagging if R2 behaves strictly.
    })

    const presignedUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 300 })

    return c.json({ url: presignedUrl, key })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return c.json({ message: 'Failed to generate upload URL' }, 500)
  }
}

export const deleteFile = async (c: Context) => {
  try {
    const body = await c.req.json()
    const result = deleteFileSchema.safeParse(body)

    if (!result.success) {
      return c.json(
        { message: 'Invalid request body', errors: result.error.errors },
        400
      )
    }

    const { key } = result.data

    const command = new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME ?? '',
      Key: key,
    })

    await getR2Client().send(command)

    return c.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('Error deleting file:', error)
    return c.json({ message: 'Failed to delete file' }, 500)
  }
}

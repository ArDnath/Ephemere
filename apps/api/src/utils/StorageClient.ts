import { S3Client } from '@aws-sdk/client-s3'

let client: S3Client | null = null

export function getR2Client(): S3Client {
  if (!client) {
    const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error('Missing required Cloudflare R2 S3 credentials')
    }

    client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  return client
}

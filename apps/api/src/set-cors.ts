import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT ?? '',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? '',
  },
})

async function setCors() {
  try {
    console.log('Setting CORS for bucket:', process.env.CLOUDFLARE_R2_BUCKET_NAME)
    const command = new PutBucketCorsCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'], // Or restrict to 'http://localhost:3000' in prod
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    })

    await r2Client.send(command)
    console.log('CORS configured successfully.')
  } catch (err) {
    console.error('Error setting CORS:', err)
  }
}

setCors()

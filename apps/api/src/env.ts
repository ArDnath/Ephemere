export type ApiBindings = {
  DATABASE_URL: string
  JWT_SECRET: string
  FRONTEND_URL?: string
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
  CLOUDFLARE_R2_ACCESS_KEY_ID?: string
  CLOUDFLARE_R2_SECRET_ACCESS_KEY?: string
  CLOUDFLARE_R2_ENDPOINT?: string
  CLOUDFLARE_R2_BUCKET_NAME?: string
  CDN_URL?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  RAZORPAY_KEY_ID?: string
  RAZORPAY_KEY_SECRET?: string
  ENVIRONMENT?: string
  R2_BUCKET?: unknown
}

type ProcessLike = {
  env: Record<string, string | undefined>
}

const runtimeGlobal = globalThis as unknown as {
  process?: ProcessLike
}

export function installRuntimeEnv(bindings: Partial<ApiBindings>): void {
  runtimeGlobal.process ??= { env: {} }
  runtimeGlobal.process.env ??= {}

  for (const [key, value] of Object.entries(bindings)) {
    if (typeof value === 'string') {
      runtimeGlobal.process.env[key] = value
    }
  }
}

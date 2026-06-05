
import type { NextConfig } from 'next'
import path from 'path'

const monorepoRoot = path.join(__dirname, '../../')

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  transpilePackages: [
    '@ephemere/lib',
    '@ephemere/ui',
    '@ephemere/tailwind-config',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatar.iran.liara.run' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
    ],
  },
}

export default nextConfig
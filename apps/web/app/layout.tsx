/* eslint-disable import/no-unresolved */
import './globals.css'
import '@ephemere/ui/style.css'
import { Analytics } from '@vercel/analytics/react'
import {
  Space_Grotesk,
  Playfair_Display,
  Space_Mono,
  Caveat,
} from 'next/font/google'
import type { Metadata } from 'next'
import { Toaster } from 'sonner'

const fontSans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontSerif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
})

const fontMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

const fontScript = Caveat({
  subsets: ['latin'],
  variable: '--font-script',
})

import { ReactQueryProvider } from '@/providers/ReactQueryProvider'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://ephemere-chat.com')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Ephemere - Real-time Chat',
    template: '%s | Ephemere',
  },
  description:
    'Create instant chat rooms for quick collaboration and easy sharing. No signup needed - just seamless communication on demand.',
  keywords: ['chat', 'real-time', 'communication', 'ephemere', 'chat rooms'],
  authors: [
    {
      name: 'Rohit Singh Rawat',
    },
  ],
  creator: 'Ephemere',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ephemere-chat.com',
    title: 'Ephemere - Real-time Chat',
    description:
      'Create instant chat rooms for quick collaboration and easy sharing. No signup needed - just seamless communication on demand.',
    siteName: 'Ephemere',
    images: [
      {
        url: '/images/ephemere.png',
        width: 800,
        height: 600,
        alt: 'Ephemere Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ephemere - Real-time Chat',
    description:
      'Create instant chat rooms for quick collaboration and easy sharing. No signup needed - just seamless communication on demand.',
    creator: '@Spacing_Whale',
    images: ['/images/ephemere.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="MyWebSite" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="image/png" href="/images/ephemere.png" />
      </head>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} ${fontScript.variable} ${fontSans.className} antialiased`}
      >
        <main>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </main>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}

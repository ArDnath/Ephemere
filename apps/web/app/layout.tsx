/* eslint-disable import/no-unresolved */
import './globals.css'
import '@ephemere/ui/style.css'
import { Analytics } from '@vercel/analytics/react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import { Toaster } from 'sonner'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

import { ReactQueryProvider } from '@/providers/ReactQueryProvider'

export const metadata: Metadata = {
  title: {
    default: 'ephemere - Real-time Chat',
    template: '%s | ephemere',
  },
  description:
    'Create instant chat rooms for quick collaboration and easy sharing. No signup needed - just seamless communication on demand.',
  keywords: ['chat', 'real-time', 'communication', 'echo', 'chat rooms'],
  authors: [
    {
      name: 'Ariyaman Debnath',
    },
  ],
  creator: 'ephemer',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ephemer.ariyaman.in',
    title: 'ephemere - Real-time Chat',
    description:
      'Create instant chat rooms for quick collaboration and easy sharing. No signup needed - just seamless communication on demand.',
    siteName: 'ephemere',
    images: [
      {
        url: '/images/ephemere.png',
        width: 800,
        height: 600,
        alt: 'ephemere Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echo - Real-time Chat',
    description:
      'Create instant chat rooms for quick collaboration and easy sharing. No signup needed - just seamless communication on demand.',
    creator: '@AriyamanDe12_24',
    images: ['/images/ephemere.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const themeScript = `
    (() => {
      try {
        const stored = localStorage.getItem('theme');
        const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = stored === 'light' || stored === 'dark' ? stored : preferred;
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.style.colorScheme = theme;
      } catch (_) {}
    })();
  `

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
        className={`${fontSans.variable} ${fontMono.variable} ${fontSans.className} antialiased`}
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

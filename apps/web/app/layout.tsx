import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'

import { ReactQueryProvider } from '@/providers/ReactQueryProvider'

import './globals.css'
import '@ephemere/ui/style.css'

const fontSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans',
  display: 'swap',
})

const fontMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
  display: 'swap',
})


export const metadata: Metadata = {
  metadataBase: new URL('https://ephemere.ariyaman.in'),
  title: {
    default: 'Ephemere — Rooms that disappear',
    template: '%s | Ephemere',
  },
  description:
    'Create temporary chat rooms instantly. Share ideas, collaborate, and chat — rooms expire automatically, leaving no trace behind.',
  keywords: ['chat', 'real-time', 'ephemeral', 'chat rooms', 'collaboration'],
  authors: [{ name: 'Ariyaman Debnath' }],
  creator: 'Ariyaman Debnath',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ephemere.ariyaman.in',
    title: 'Ephemere — Real-time Chat',
    description:
      'Create temporary chat rooms instantly. Rooms expire automatically, leaving no trace behind.',
    siteName: 'Ephemere',
    images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'Ephemere' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ephemere — Real-time Chat',
    description:
      'Create temporary chat rooms instantly. Rooms expire automatically, leaving no trace behind.',
    creator: '@AriyamanDe12_24',
    images: ['/opengraph-image.png'],
  },
}

const themeScript = `(()=>{try{
  const s=localStorage.getItem('theme');
  const p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  const t=s==='light'||s==='dark'?s:p;
  document.documentElement.classList.toggle('dark',t==='dark');
  document.documentElement.style.colorScheme=t;
}catch(_){}})();`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${fontSans.variable} ${fontMono.variable} ${fontSans.className} antialiased`}>
        <ReactQueryProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'

import BentoSection from '@/components/Home/BentoSection'
import ContactUs from '@/components/Home/ContactUs'
import { FeatureCards } from '@/components/Home/Features/FeatureCards'
import { Hero } from '@/components/Home/Hero'

export const metadata: Metadata = {
  title: 'Ephemere - Real-time Chat',
  description:
    'Create instant chat rooms for quick collaboration and easy sharing. No signup needed - just seamless communication on demand.',
  keywords: [
    'chat',
    'real-time',
    'communication',
    'instant messaging',
    'collaboration',
    'ephemere',
  ],
  openGraph: {
    title: 'Ephemere - Real-time Chat',
    description:
      'Create instant chat rooms for quick collaboration and easy sharing. No signup needed - just seamless communication on demand.',
    images: ['/images/ephemere.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ephemere - Real-time Chat',
    description:
      'Create instant chat rooms for quick collaboration and easy sharing. No signup needed - just seamless communication on demand.',
    images: ['/images/ephemere.png'],
  },
}

const Page = () => {
  return (
    <div className="bg-transparent text-[hsl(var(--foreground))]">
      <div className="container px-2 md:px-4 lg:px-8 xl:px-12">
        <Hero />
        <BentoSection />
        <FeatureCards />
        <ContactUs />
      </div>
    </div>
  )
}

export default Page

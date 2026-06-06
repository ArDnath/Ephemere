import Link from 'next/link'

import EphemereLogo from '../icons/animated/EphemereLogo'

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-[hsl(var(--border))] bg-[hsl(var(--card)/0.55)] backdrop-blur">
      <div className="container mx-auto px-4 py-12 sm:px-8 md:px-12 lg:px-20 lg:py-24">
        <div className="flex flex-col space-y-12 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
          <div className="space-y-3">
            <EphemereLogo />

            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              copyright &copy; {new Date().getFullYear()} Ephemere. All rights
              reserved.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 sm:gap-16 md:gap-24">
            <div className="flex flex-col space-y-5">
              <h3 className="font-medium text-[hsl(var(--foreground))]">Pages</h3>
              <Link
                href="/join-room"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Join Room
              </Link>
              <Link
                href="/plans"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Pricing
              </Link>
              <Link
                href="/#bento"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                features
              </Link>
              <Link
                href="/#contact"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Contact
              </Link>
            </div>

            <div className="flex flex-col space-y-5">
              <h3 className="font-medium text-[hsl(var(--foreground))]">Socials</h3>
              <Link
                href="https://github.com/ArDnath"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                GitHub
              </Link>
              <Link
                href="https://x.com/AriyamanDe12_24"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Twitter
              </Link>
              <Link
                href="mailto:ariyamandebnath.ad@gmail.com"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Email
              </Link>
            </div>

            <div className="flex flex-col space-y-5">
              <h3 className="font-medium text-[hsl(var(--foreground))]">Legal</h3>
              <Link
                href="/privacy"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookie"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

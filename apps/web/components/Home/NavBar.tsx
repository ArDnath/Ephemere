'use client'

import { motion, useScroll } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { navLinks } from '@/constants'

import EphemereLogo from '../icons/animated/EphemereLogo'
import { ThemeToggle } from '../theme/ThemeToggle'

import { AuthLinks } from './AuthLinks'
import HamburgerMenu from './HamburgerMenu'
import { NavLinks } from './NavLinks'

const DesktopNav = ({ isScrolled }: { isScrolled: boolean }) => {
  return (
    <motion.div
      className="z-[60] mx-auto hidden w-full max-w-7xl items-center justify-between rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.72)] p-2.5 px-7 shadow-sm backdrop-blur-2xl lg:flex lg:min-w-[800px]"
      initial={{ width: '100%' }}
      animate={{
        width: isScrolled ? '40%' : '100%',
        y: isScrolled ? 20 : 0,
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        boxShadow: isScrolled ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
      transition={{
        duration: 0.6,
        ease: 'easeInOut',
      }}
      style={{ minWidth: '800px' }}
    >
      <EphemereLogo />

      <NavLinks />

      <div className="z-[60] flex items-center gap-2">
        <ThemeToggle />
        <AuthLinks isScrolled={isScrolled} />
      </div>
    </motion.div>
  )
}
const MobileNav = ({ isScrolled }: { isScrolled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className="relative z-50 mx-auto space-y-2"
      initial={{ y: 0 }}
      animate={{
        y: isScrolled ? 20 : 0,
        width: isScrolled ? '93%' : '100%',
      }}
      transition={{
        duration: 0.6,
        ease: 'easeInOut',
      }}
    >
      <motion.div
        className="relative flex w-full flex-col justify-between rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.78)] p-4 shadow-sm backdrop-blur-2xl lg:hidden"
        animate={{
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          boxShadow: isScrolled ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center justify-between">
          <EphemereLogo />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <HamburgerMenu isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
        className="flex lg:hidden"
      >
        <div className="z-50 flex w-full flex-col items-start justify-start gap-4 rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.94)] px-4 py-8 shadow-[var(--shadow-md)] backdrop-blur-xl">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.6)] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              onClick={() => setIsOpen(false)}
            >
              <span className="block">{label}</span>
            </Link>
          ))}
          <div className="grid w-full flex-col gap-2">
            <Link
              href="/login"
              className="button relative block w-full cursor-pointer rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-center text-sm font-bold text-[hsl(var(--foreground))] shadow-sm transition duration-200 hover:-translate-y-0.5 lg:hidden"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="button relative block w-full cursor-pointer rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-center text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition duration-200 hover:-translate-y-0.5 lg:hidden"
            >
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export const NavBar = () => {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (value) => {
      setIsScrolled(value > 20)
    })
    return () => unsubscribe()
  }, [scrollY])

  return (
    <div className="fixed inset-x-0 top-0 z-[100] w-full p-2">
      <DesktopNav isScrolled={isScrolled} />
      <MobileNav isScrolled={isScrolled} />
    </div>
  )
}

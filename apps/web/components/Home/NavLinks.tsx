'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

import { navLinks } from '@/constants'

export const NavLinks = () => {
  const [activeLink, setActiveLink] = useState<string | null>(null)

  return (
    <motion.div className="absolute inset-0 flex flex-1 flex-row items-center justify-center text-sm font-medium transition duration-200 lg:flex">
      <ul className="z-50 flex items-center gap-2">
        {navLinks.map(({ href, label }) => (
          <li
            key={href}
            onMouseEnter={() => setActiveLink(href)}
            onMouseLeave={() => setActiveLink(null)}
            className="relative"
          >
            <Link
              href={href}
              className="relative block  px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--foreground)/0.72)] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              <span>
                {label}
              </span>
            </Link>
            {activeLink === href ? (
              <motion.div
                layoutId="highlight"
                className="absolute inset-0 -z-10 rounded-full bg-[hsl(var(--primary)/0.06)]"
              />
            ) : null}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

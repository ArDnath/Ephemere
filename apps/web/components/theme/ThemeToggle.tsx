'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'

  const storedTheme = window.localStorage.getItem('theme')
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const preferredTheme = getPreferredTheme()
    setTheme(preferredTheme)
    applyTheme(preferredTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    window.localStorage.setItem('theme', nextTheme)
    applyTheme(nextTheme)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="inline-flex size-9 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.72)] text-[hsl(var(--foreground))] shadow-sm backdrop-blur transition hover:border-[hsl(var(--primary)/0.45)] hover:text-[hsl(var(--primary))]"
    >
      <Sun className="size-4 rotate-0 scale-100 transition dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition dark:rotate-0 dark:scale-100" />
    </button>
  )
}

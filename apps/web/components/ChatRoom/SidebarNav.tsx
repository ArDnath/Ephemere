'use client'

import { useState } from 'react'
import {
  Compass,
  LayoutGrid,
  MessageSquareMore,
  Search,
  Settings2,
  Share2,
} from 'lucide-react'

const navItems = [
  { id: 'clusters', label: 'Clusters', icon: LayoutGrid },
  { id: 'rooms', label: 'Rooms', icon: MessageSquareMore },
  { id: 'routing', label: 'Routing', icon: Share2 },
  { id: 'search', label: 'Search', icon: Search },
]

export const SidebarNav = () => {
  const [activeNav, setActiveNav] = useState('clusters')

  return (
    <aside className="paper-shell noise-overlay halftone-shadow relative z-20 flex h-full flex-row items-stretch border-b border-amber-900/20 xl:flex-col xl:border-b-0 xl:border-r">
      <div className="flex flex-1 items-center justify-around gap-1 px-2 py-2 xl:flex-col xl:justify-start xl:px-0 xl:py-4">
        <div className="flex size-10 items-center justify-center rounded-[18px_12px_18px_12px] border border-amber-500/20 bg-black/30 font-serif text-xl font-black text-amber-100 shadow-[6px_6px_0_rgba(0,0,0,0.2)] xl:mb-3 xl:size-11">
          E
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.id

          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => setActiveNav(item.id)}
              className={`group relative flex size-10 items-center justify-center rounded-[16px_12px_17px_13px] border transition-all duration-300 ${
                isActive
                  ? 'border-amber-400/45 bg-amber-400/15 text-amber-100'
                  : 'border-amber-900/15 bg-black/10 text-amber-100/45 hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-100'
              }`}
            >
              <Icon className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          )
        })}
      </div>

      <div className="flex flex-row items-center gap-2 border-l border-amber-900/15 px-2 py-2 xl:mt-auto xl:flex-col xl:border-l-0 xl:border-t xl:px-0 xl:py-3">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-[18px_14px_18px_14px] border border-amber-900/15 bg-black/20 text-amber-100/60 transition-colors hover:border-amber-400/25 hover:text-amber-100"
          title="Navigator"
        >
          <Compass className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-amber-900/15 bg-emerald-400/10 text-emerald-200 transition-colors hover:border-emerald-300/30 hover:bg-emerald-400/20"
          title="Settings"
        >
          <Settings2 className="size-4" />
        </button>
      </div>
    </aside>
  )
}

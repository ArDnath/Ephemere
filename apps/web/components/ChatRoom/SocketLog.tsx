'use client'

import { useEffect, useRef, useState } from 'react'

type LogEntry = {
  id: string
  timestamp: string
  message: string
  type: 'ok' | 'warn' | 'error' | 'info'
}

const initialLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '09:44:16',
    message: '[CONN] α-7f2 → β-3a1 :: WS_OPEN',
    type: 'ok',
  },
  {
    id: '2',
    timestamp: '09:44:17',
    message: '[MSG] fragment 1/3 delivered · 8ms',
    type: 'info',
  },
  {
    id: '3',
    timestamp: '09:44:18',
    message: '[WARN] γ-9c4 heartbeat miss #1',
    type: 'warn',
  },
  {
    id: '4',
    timestamp: '09:44:19',
    message: '[MSG] fragment 2/3 in flight...',
    type: 'info',
  },
  {
    id: '5',
    timestamp: '09:44:20',
    message: '[ERR] δ-1e8 :: CONNECTION_REFUSED',
    type: 'error',
  },
  {
    id: '6',
    timestamp: '09:44:21',
    message: '[MESH] self-heal reroute initiated',
    type: 'ok',
  },
]

const toneClass = {
  ok: 'text-emerald-200',
  warn: 'text-amber-200',
  error: 'text-red-200',
  info: 'text-amber-50/70',
} as const

export const SocketLog = () => {
  const [logs] = useState(initialLogs)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [logs])

  return (
    <div className="paper-shell noise-overlay halftone-shadow relative flex min-h-0 flex-1 flex-col overflow-hidden border-t border-amber-900/20">
      <div className="border-b border-amber-900/20 px-4 py-3">
        <p className="meta-mono text-amber-200/50">socket log</p>
        <p className="accent-script mt-1 text-amber-300/90">live traces</p>
      </div>

      <div ref={scrollRef} className="chat-scroll min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-[10px]">
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2">
              <span className="text-amber-100/45">{log.timestamp}</span>
              <span className={toneClass[log.type]}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

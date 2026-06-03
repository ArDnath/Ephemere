'use client'

import { useMemo, useState } from 'react'
import { Hash, Lock, SignalHigh, TriangleAlert } from 'lucide-react'

type Channel = {
  id: string
  name: string
  type: 'public' | 'private'
  unread?: number
  latency?: number
  status?: 'normal' | 'unstable'
}

const publicChannels: Channel[] = [
  { id: 'general-mesh', name: 'general-mesh', type: 'public', unread: 4 },
  { id: 'node-announcements', name: 'node-announcements', type: 'public' },
  { id: 'socket-debug', name: 'socket-debug', type: 'public', latency: 12 },
  { id: 'edge-relay', name: 'edge-relay', type: 'public', status: 'unstable' },
  { id: 'distributed-ops', name: 'distributed-ops', type: 'public' },
]

const privateThreads: Channel[] = [
  { id: 'cipher-relay', name: 'cipher-relay', type: 'private', latency: 3 },
  { id: 'root-sync', name: 'root-sync', type: 'private' },
  { id: 'terminus-logs', name: 'terminus-logs', type: 'private' },
]

const nodes = [
  { id: 'α-7f2', status: 'online' as const },
  { id: 'β-3a1', status: 'online' as const },
  { id: 'γ-9c4', status: 'warning' as const },
  { id: 'δ-1e8', status: 'offline' as const },
]

type ChannelExplorerProps = {
  activeChannel?: string
  onChannelSelect?: (channelId: string) => void
}

export const ChannelExplorer = ({
  activeChannel,
  onChannelSelect,
}: ChannelExplorerProps) => {
  const [clusterLabel] = useState('NODE-CLUSTER-α')
  const onlineCount = useMemo(
    () => nodes.filter((node) => node.status === 'online').length,
    []
  )

  const renderChannel = (channel: Channel) => {
    const isActive = activeChannel === channel.id

    return (
      <button
        key={channel.id}
        type="button"
        onClick={() => onChannelSelect?.(channel.id)}
        className={`group flex w-full items-center gap-2 border px-3 py-2.5 text-left transition-all duration-300 ${
          isActive
            ? 'border-amber-400/35 bg-amber-400/10 text-amber-50 shadow-[6px_6px_0_rgba(0,0,0,0.18)]'
            : 'border-amber-900/10 bg-black/10 text-amber-100/70 hover:border-amber-400/20 hover:bg-amber-400/8 hover:text-amber-50'
        } irregular-sheet`}
      >
        <Hash className="size-3.5 shrink-0 opacity-70" />
        <span className="min-w-0 flex-1 truncate font-sans text-sm">{channel.name}</span>
        {channel.unread ? (
          <span className="rounded-full border border-amber-400/20 bg-amber-400/15 px-2 py-0.5 font-mono text-[10px] text-amber-100">
            {channel.unread}
          </span>
        ) : null}
        {channel.latency ? (
          <span className="font-mono text-[10px] text-emerald-200/90">
            {channel.latency}ms
          </span>
        ) : null}
        {channel.status === 'unstable' ? (
          <TriangleAlert className="size-3.5 text-red-300" />
        ) : null}
      </button>
    )
  }

  return (
    <aside className="paper-shell noise-overlay halftone-shadow relative z-20 flex h-full min-h-0 flex-col overflow-hidden border-b border-amber-900/20 xl:border-b-0 xl:border-r">
      <div className="border-b border-amber-900/20 px-4 py-4">
        <p className="meta-mono text-amber-200/55">server explorer</p>
        <h2 className="mt-1 font-serif text-3xl font-black leading-[0.92] text-amber-50">
          Nexus
          <br />
          Protocol
        </h2>
        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100/60">
          <span className="inline-flex items-center gap-1">
            <SignalHigh className="size-3 text-emerald-300" />
            {clusterLabel}
          </span>
          <span>•</span>
          <span>{onlineCount} online</span>
        </div>
      </div>

      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-4">
          <div>
            <p className="meta-mono mb-2 text-amber-200/50">public channels</p>
            <div className="space-y-2">{publicChannels.map(renderChannel)}</div>
          </div>
          <div>
            <p className="meta-mono mb-2 text-amber-200/50">private threads</p>
            <div className="space-y-2">
              {privateThreads.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => onChannelSelect?.(channel.id)}
                  className={`group flex w-full items-center gap-2 border px-3 py-2.5 text-left transition-all duration-300 irregular-sheet ${
                    activeChannel === channel.id
                      ? 'border-cyan-300/30 bg-cyan-400/10 text-amber-50 shadow-[6px_6px_0_rgba(0,0,0,0.18)]'
                      : 'border-amber-900/10 bg-black/10 text-amber-100/70 hover:border-cyan-300/20 hover:bg-cyan-400/8 hover:text-amber-50'
                  }`}
                >
                  <Lock className="size-3.5 shrink-0 opacity-70 text-amber-200/80" />
                  <span className="min-w-0 flex-1 truncate font-sans text-sm">
                    {channel.name}
                  </span>
                  {channel.latency ? (
                    <span className="font-mono text-[10px] text-emerald-200/90">
                      {channel.latency}ms
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-amber-900/20 px-4 py-3">
        <p className="meta-mono mb-2 text-amber-200/50">connected nodes</p>
        <div className="flex flex-wrap gap-2">
          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={`rounded-[14px_12px_16px_14px] border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-all ${
                node.status === 'online'
                  ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100'
                  : node.status === 'warning'
                    ? 'border-amber-300/30 bg-amber-400/10 text-amber-100'
                    : 'border-red-300/30 bg-red-500/10 text-red-100'
              }`}
            >
              {node.id}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

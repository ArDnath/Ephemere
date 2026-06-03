'use client'

import { useMemo } from 'react'
import { ReadyState } from 'react-use-websocket'
import { Activity, RadioTower, SignalHigh } from 'lucide-react'

import { UserIdentity } from '@/types'

import { NetworkVisualization3D } from './NetworkVisualization3D'
import { SocketLog } from './SocketLog'

type NetworkStatusPanelProps = {
  readyState: ReadyState
  roomId: string
  roomName: string
  participants: UserIdentity[]
  activeCluster: string
  onClusterSelect: (clusterId: string) => void
}

const statusCopy: Record<ReadyState, string> = {
  [ReadyState.UNINSTANTIATED]: 'uninstantiated',
  [ReadyState.CONNECTING]: 'dialing',
  [ReadyState.OPEN]: 'connected',
  [ReadyState.CLOSING]: 'closing',
  [ReadyState.CLOSED]: 'disconnected',
}

export const NetworkStatusPanel = ({
  readyState,
  roomId,
  roomName,
  participants,
  activeCluster,
  onClusterSelect,
}: NetworkStatusPanelProps) => {
  const unstable = readyState !== ReadyState.OPEN

  const metrics = useMemo(
    () => ({
      latency: readyState === ReadyState.OPEN ? 24 + participants.length * 3 : 0,
      throughput: readyState === ReadyState.OPEN ? Math.max(1, participants.length * 7) : 0,
      nodeId: `${roomId.slice(0, 4).toUpperCase()}-${activeCluster.toUpperCase()}`,
    }),
    [activeCluster, participants.length, readyState, roomId]
  )

  return (
    <aside className="paper-shell noise-overlay halftone-shadow relative z-20 flex h-full min-h-0 flex-col overflow-hidden border-l border-amber-900/20">
      <div className="border-b border-amber-900/20 px-4 py-4">
        <p className="meta-mono text-amber-200/55">network status</p>
        <h2 className="mt-1 font-serif text-3xl font-black leading-[0.92] text-amber-50">
          Network
          <br />
          Topology
        </h2>
        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100/60">
          <SignalHigh className={`size-3 ${unstable ? 'text-red-300' : 'text-emerald-300'}`} />
          <span>{statusCopy[readyState]}</span>
          <span>•</span>
          <span>{roomName}</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-3">
        <NetworkVisualization3D
          readyState={readyState}
          activeCluster={activeCluster}
          onClusterSelect={onClusterSelect}
          participants={participants.length}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 border-y border-amber-900/20 px-3 py-3">
        <div className="rounded-[14px_12px_14px_12px] border border-amber-900/20 bg-black/20 px-3 py-2">
          <p className="meta-mono text-amber-200/45">latency</p>
          <p className="mt-1 font-mono text-base text-amber-50">
            <Activity className="mr-1 inline size-3.5 text-amber-300" />
            {metrics.latency}
            <span className="text-sm text-amber-100/60">ms</span>
          </p>
        </div>
        <div className="rounded-[14px_12px_14px_12px] border border-amber-900/20 bg-black/20 px-3 py-2">
          <p className="meta-mono text-amber-200/45">throughput</p>
          <p className="mt-1 font-mono text-base text-amber-50">
            <RadioTower className="mr-1 inline size-3.5 text-emerald-300" />
            {metrics.throughput}
            <span className="text-sm text-amber-100/60">/s</span>
          </p>
        </div>
        <div className="rounded-[14px_12px_14px_12px] border border-amber-900/20 bg-black/20 px-3 py-2">
          <p className="meta-mono text-amber-200/45">node id</p>
          <p className="mt-1 truncate font-mono text-sm text-amber-50">{metrics.nodeId}</p>
        </div>
        <div className="rounded-[14px_12px_14px_12px] border border-amber-900/20 bg-black/20 px-3 py-2">
          <p className="meta-mono text-amber-200/45">peers</p>
          <p className="mt-1 font-mono text-base text-amber-50">{participants.length}</p>
        </div>
      </div>

      <SocketLog />

      <div className="border-t border-amber-900/20 px-4 py-3">
        <p className="meta-mono mb-2 text-amber-200/55">cluster routing</p>
        <div className="flex flex-wrap gap-2">
          {['α', 'β', 'γ', 'δ'].map((cluster) => {
            const clusterId = cluster.toLowerCase()
            const selected = activeCluster === clusterId
            return (
              <button
                key={cluster}
                type="button"
                onClick={() => onClusterSelect(clusterId)}
                className={`rounded-[14px_12px_14px_12px] border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all ${
                  selected
                    ? 'border-amber-300/35 bg-amber-400/15 text-amber-50'
                    : 'border-amber-900/15 bg-black/15 text-amber-100/60 hover:border-amber-300/20 hover:bg-amber-400/10 hover:text-amber-50'
                }`}
              >
                CLUSTER-{cluster}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

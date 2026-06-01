'use client'

import { ReadyState } from 'react-use-websocket'
import { Activity, RadioTower } from 'lucide-react'
import { useMemo, useState } from 'react'

import { UserIdentity } from '@/types'

type NetworkStatusPanelProps = {
  readyState: ReadyState
  roomId: string
  roomName: string
  participants: UserIdentity[]
}

const clusters = [
  { id: 'north', label: 'North Relay', x: '18%', y: '58%', z: -42 },
  { id: 'core', label: 'Core Socket', x: '50%', y: '35%', z: 42 },
  { id: 'edge', label: 'Edge Cache', x: '76%', y: '62%', z: -18 },
]

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
}: NetworkStatusPanelProps) => {
  const [activeCluster, setActiveCluster] = useState('core')
  const unstable = readyState !== ReadyState.OPEN

  const metrics = useMemo(
    () => ({
      latency: readyState === ReadyState.OPEN ? 24 + participants.length * 3 : 0,
      throughput:
        readyState === ReadyState.OPEN
          ? Math.max(1, participants.length * 7)
          : 0,
      nodeId: `${roomId.slice(0, 4).toUpperCase()}-${activeCluster.toUpperCase()}`,
    }),
    [activeCluster, participants.length, readyState, roomId]
  )

  return (
    <aside className="chat-scroll hidden h-full w-[19rem] shrink-0 overflow-y-auto xl:block">
      <section
        className={`paper-shell halftone-shadow relative flex h-full flex-col overflow-hidden border border-[#3e2c1a] p-4 ${
          unstable ? 'socket-warp' : ''
        }`}
      >
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6f5b3d]">
              socket topology
            </p>
            <h2 className="font-serif text-3xl font-black leading-none text-[#281d12]">
              {roomName || 'Cluster'}
            </h2>
          </div>
          <span
            className={`rounded-full border border-[#3e2c1a] px-2 py-1 font-mono text-[10px] uppercase ${
              readyState === ReadyState.OPEN
                ? 'bg-[#a7e2b7] text-[#143b25]'
                : 'bg-[#d76862] text-[#2d120f]'
            }`}
          >
            {statusCopy[readyState]}
          </span>
        </div>

        <div className="network-perspective relative z-10 my-5 aspect-[1/0.9] overflow-hidden border border-[#3e2c1a]/70 bg-[#2a1c10]">
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,192,73,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,192,73,.18)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="absolute inset-0 transition-transform duration-500 [transform:rotateX(58deg)_rotateZ(-18deg)] [transform-style:preserve-3d]">
            <svg className="absolute inset-0 size-full" aria-hidden="true">
              <line
                x1="18%"
                y1="58%"
                x2="50%"
                y2="35%"
                stroke="#f5a623"
                strokeDasharray="5 7"
                strokeWidth="2"
              />
              <line
                x1="50%"
                y1="35%"
                x2="76%"
                y2="62%"
                stroke="#48d08d"
                strokeDasharray="4 5"
                strokeWidth="2"
              />
              <line
                x1="18%"
                y1="58%"
                x2="76%"
                y2="62%"
                stroke="#f5e8c8"
                strokeOpacity=".38"
                strokeWidth="1"
              />
            </svg>
            {clusters.map((cluster) => (
              <button
                key={cluster.id}
                type="button"
                onClick={() => setActiveCluster(cluster.id)}
                className={`absolute grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center border border-[#f5e8c8] font-mono text-[9px] uppercase transition-all duration-300 ${
                  activeCluster === cluster.id
                    ? 'bg-[#ffc247] text-[#24180d] shadow-[0_0_18px_rgba(255,194,71,.65)]'
                    : 'bg-[#3b2b18] text-[#f5e8c8] hover:bg-[#57d993] hover:text-[#172418]'
                }`}
                style={{
                  left: cluster.x,
                  top: cluster.y,
                  transform: `translate(-50%, -50%) translateZ(${cluster.z}px)`,
                }}
                aria-label={`Switch to ${cluster.label}`}
              >
                {cluster.id}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid gap-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#3e2c1a]/30 pb-2">
            <span className="flex items-center gap-2 text-[#6f5b3d]">
              <Activity className="size-4" />
              latency
            </span>
            <strong>{metrics.latency}ms</strong>
          </div>
          <div className="flex items-center justify-between border-b border-[#3e2c1a]/30 pb-2">
            <span className="flex items-center gap-2 text-[#6f5b3d]">
              <RadioTower className="size-4" />
              packet rate
            </span>
            <strong>{metrics.throughput}/s</strong>
          </div>
          <div className="flex items-center justify-between border-b border-[#3e2c1a]/30 pb-2">
            <span className="text-[#6f5b3d]">node id</span>
            <strong>{metrics.nodeId}</strong>
          </div>
        </div>

        <p className="relative z-10 mt-4 font-script text-2xl leading-none text-[#a03a35]">
          {unstable ? 'signal bending' : 'handshake warm'}
        </p>
      </section>
    </aside>
  )
}

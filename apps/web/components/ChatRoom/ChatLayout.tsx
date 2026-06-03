'use client'

import { motion } from 'framer-motion'
import { LogOut, Waves } from 'lucide-react'

import { ReadyState } from 'react-use-websocket'

import { Message, UserIdentity } from '@/types'

import { SidebarNav } from './SidebarNav'
import { ChannelExplorer } from './ChannelExplorer'
import ChatBox from './ChatBox'
import { NetworkStatusPanel } from './NetworkStatusPanel'
import Countdown from './Countdown'

interface ChatLayoutProps {
  roomName: string
  roomId: string
  timeLeft: Date
  messages: Message[]
  sendMessage: (content: string, image?: string) => void
  sendReaction: (messageId: string, emoji: string, currentEmoji?: string) => void
  handleExit: () => void
  readyState: ReadyState
  participants: UserIdentity[]
  activeChannel?: string
  onChannelSelect?: (channelId: string) => void
  activeCluster: string
  onClusterSelect: (clusterId: string) => void
}

export const ChatLayout = ({
  roomName,
  roomId,
  timeLeft,
  messages,
  sendMessage,
  sendReaction,
  handleExit,
  readyState,
  participants,
  activeChannel,
  onChannelSelect,
  activeCluster,
  onClusterSelect,
}: ChatLayoutProps) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_15%_20%,rgba(232,180,88,0.18),transparent_18rem),radial-gradient(circle_at_80%_85%,rgba(111,181,141,0.08),transparent_20rem),linear-gradient(180deg,hsl(32,28%,10%),hsl(32,28%,7%))] text-amber-50">
      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light [background-image:radial-gradient(circle,rgba(255,255,255,0.08)_0.8px,transparent_0.9px)] [background-size:5px_5px]" />

      <div className="relative grid h-full min-h-0 grid-cols-1 xl:grid-cols-[4.75rem_16rem_minmax(0,1fr)_18rem]">
        <SidebarNav />

        <ChannelExplorer
          activeChannel={activeChannel}
          onChannelSelect={onChannelSelect}
        />

        <motion.main
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex min-h-0 flex-col overflow-hidden border-l border-r border-amber-900/20 xl:border-l-0 xl:border-r-0"
        >
          <motion.div
            key={activeCluster}
            initial={{ opacity: 0.45, y: 6, rotateX: 5 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="noise-overlay paper-shell halftone-shadow relative z-10 mx-3 mt-3 flex-shrink-0 border border-amber-900/25 px-4 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.18)] xl:mx-4 xl:mt-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="meta-mono mb-2 flex items-center gap-2 text-amber-700/70">
                  <Waves className="size-3" />
                  distributed chat fabric
                </p>
                <h1 className="font-serif text-3xl font-black leading-none text-amber-50 md:text-5xl">
                  {roomName}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100/60">
                  <span>cluster {activeCluster.toUpperCase()}</span>
                  <span>•</span>
                  <span>{participants.length} peers</span>
                  <span>•</span>
                  <span>room {roomId}</span>
                  <span>•</span>
                  <span>depth synced</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-[14px_12px_14px_12px] border border-amber-300/12 bg-black/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-50/75">
                  expires
                  <Countdown endDate={timeLeft} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                  live fabric
                </span>
                <button
                  onClick={handleExit}
                  className="group inline-flex items-center gap-2 rounded-[18px_14px_18px_14px] border border-red-400/20 bg-black/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-red-200 transition-transform duration-300 hover:-translate-y-0.5 hover:border-red-300/45 hover:bg-red-500/10 active:translate-y-0"
                >
                  exit
                  <LogOut className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="relative min-h-0 flex-1 p-3 pb-4 xl:p-4">
            <ChatBox
              messages={messages}
              sendMessage={sendMessage}
              sendReaction={sendReaction}
            />
          </div>
        </motion.main>

        <NetworkStatusPanel
          readyState={readyState}
          roomId={roomId}
          roomName={roomName}
          participants={participants}
          activeCluster={activeCluster}
          onClusterSelect={onClusterSelect}
        />
      </div>
    </div>
  )
}

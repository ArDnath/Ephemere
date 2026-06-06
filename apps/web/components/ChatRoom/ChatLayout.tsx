'use client'

import { motion } from 'framer-motion'
import { LogOut, Users } from 'lucide-react'
import Image from 'next/image'
import { ReadyState } from 'react-use-websocket'

import { Message, UserIdentity } from '@/types'
import { useIdentityStore } from '@/lib/store/useIdentityStore'

import ChatBox from './ChatBox'
import Countdown from './Countdown'
import { PublicRoomShare } from './PublicRoomShare'

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
  isNewRoom?: boolean
}

const connectionLabel: Record<ReadyState, string> = {
  [ReadyState.UNINSTANTIATED]: 'idle',
  [ReadyState.CONNECTING]: 'connecting',
  [ReadyState.OPEN]: 'live',
  [ReadyState.CLOSING]: 'closing',
  [ReadyState.CLOSED]: 'offline',
}

const connectionClass: Record<ReadyState, string> = {
  [ReadyState.UNINSTANTIATED]: 'disconnected',
  [ReadyState.CONNECTING]: 'connecting',
  [ReadyState.OPEN]: 'connected',
  [ReadyState.CLOSING]: 'connecting',
  [ReadyState.CLOSED]: 'disconnected',
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
  isNewRoom = false,
}: ChatLayoutProps) => {
  const { userId } = useIdentityStore()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* ── Main chat column ── */}
      <motion.div
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-foreground font-semibold text-background text-sm">
              {roomName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold leading-tight text-foreground">
                {roomName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`connection-status ${connectionClass[readyState]}`} />
                <span className="text-xs text-muted-foreground">
                  {connectionLabel[readyState]}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {participants.length} {participants.length === 1 ? 'person' : 'people'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Timer */}
            <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 sm:flex">
              <span className="text-xs text-muted-foreground">expires</span>
              <span className="font-mono text-xs font-medium text-foreground">
                <Countdown endDate={timeLeft} />
              </span>
            </div>

            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </header>

        {/* Mobile timer bar */}
        <div className="flex items-center justify-center border-b border-border bg-muted/30 px-4 py-2 sm:hidden">
          <span className="text-xs text-muted-foreground">expires in&nbsp;</span>
          <span className="font-mono text-xs font-medium text-foreground">
            <Countdown endDate={timeLeft} />
          </span>
        </div>

        {isNewRoom && roomId !== 'public' && (
          <div className="border-b border-border bg-[hsl(var(--primary)/0.06)] px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              Room created. Share the invite panel below to add others.
            </p>
          </div>
        )}

        {roomId !== 'public' && (
          <div className="border-b border-border bg-muted/20 px-4 py-4 xl:hidden">
            <PublicRoomShare roomId={roomId} />
          </div>
        )}

        {/* Chat area */}
        <div className="relative min-h-0 flex-1">
          <ChatBox
            messages={messages}
            sendMessage={sendMessage}
            sendReaction={sendReaction}
          />
        </div>
      </motion.div>

      {/* ── Right sidebar ── */}
      <aside className="chat-scroll hidden w-64 flex-shrink-0 flex-col overflow-y-auto border-l border-border bg-background xl:flex">
        {/* Participants */}
        <div className="border-b border-border px-4 py-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Participants · {participants.length}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {participants
              .sort((a, b) => (a.userId === userId ? -1 : b.userId === userId ? 1 : 0))
              .map((user) => (
                <div
                  key={user.userId}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${
                    user.userId === userId
                      ? 'bg-foreground/5 ring-1 ring-foreground/8'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    width={28}
                    height={28}
                    className="size-7 rounded-full border border-border object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {user.userId === userId ? `${user.username} (you)` : user.username}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {user.userId.slice(0, 8)}
                    </p>
                  </div>
                  <span className="connection-status connected flex-shrink-0" />
                </div>
              ))}
            {participants.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">No participants yet</p>
            )}
          </div>
        </div>

        {/* Share section */}
        <div className="px-4 py-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Share room
          </p>
          <PublicRoomShare roomId={roomId} />
        </div>
      </aside>
    </div>
  )
}

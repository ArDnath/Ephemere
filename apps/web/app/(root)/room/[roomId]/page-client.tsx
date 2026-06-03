'use client'

import { useEffect, useState, useCallback } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { toast } from 'sonner'

import { ChatLayout } from '@/components/ChatRoom/ChatLayout'
import GetAnonomousity from '@/components/ChatRoom/GetAnonomousity'
import { TimeLeftDisplay } from '@/components/ChatRoom/TimeLeftDisplay'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useTempUser } from '@/hooks/useTempUser'
import useRoomStore from '@/lib/store/RoomStore'
import { useIdentityStore } from '@/lib/store/useIdentityStore'
import { Message, PageClientProps, UserIdentity } from '@/types'

// ─── Socket server event protocol ────────────────────────────────────────────
// Client → Server: join | send_message | react | remove_reaction | leave
// Server → Client: room_joined | user_joined | user_left | new_message |
//                  reaction_updated | error | self_leave

const getSocketUrl = (roomId: string) => {
  const url = new URL(process.env.NEXT_PUBLIC_WS_URL!)
  url.searchParams.set('roomId', roomId)
  return url.toString()
}

const PageClient = ({ roomId, token }: PageClientProps) => {
  const { setAnonymous, anonymous, setUserId, userId } = useIdentityStore()
  const tempUser = useTempUser()
  const [roomName, SetRoomName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<UserIdentity[]>([])
  const [timeLeft, setTimeLeft] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [shouldConnect, setShouldConnect] = useState(true)
  const [activeCluster, setActiveCluster] = useState('core')
  const [activeChannel, setActiveChannel] = useState('general-mesh')
  const socketUrl = getSocketUrl(roomId)

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    socketUrl,
    {},
    shouldConnect
  )

  useEffect(() => {
    if (!token && !anonymous) {
      setAnonymous(true)
    }
  }, [token, anonymous, setAnonymous])

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      if (!error) setError('Server connection closed. Please try again later.')
    }
  }, [readyState, error])

  const effectiveTempUser = token && !anonymous ? null : tempUser

  // ── join ──────────────────────────────────────────────────────────────────
  const handleJoinRoom = useCallback(() => {
    if (anonymous === null || readyState !== ReadyState.OPEN) return

    sendMessage(
      JSON.stringify({
        type: 'join',
        payload: {
          roomId,
          ...(effectiveTempUser
            ? {
                tempId: effectiveTempUser.tempUserId,
                tempName: effectiveTempUser.tempUserName,
                tempAvatar: effectiveTempUser.tempUserAvatar,
              }
            : { token }),
        },
      })
    )
  }, [readyState, roomId, sendMessage, effectiveTempUser, token, anonymous])

  useEffect(() => {
    handleJoinRoom()
  }, [handleJoinRoom])

  // ── Incoming message handler ──────────────────────────────────────────────
  useEffect(() => {
    if (anonymous === null || !lastMessage) return

    const data = JSON.parse(lastMessage.data)

    const handlers: Record<string, () => void> = {
      // ── Server-side errors ──────────────────────────────────────────────
      error: () => setError(data.payload.message),

      // ── Successful room join ────────────────────────────────────────────
      room_joined: () => {
        setUserId(data.payload.userId)
        setIsLoading(false)
        SetRoomName(data.payload.roomName)
        setUsers(data.payload.users)
        setMessages(data.payload.lastMessages)
        setTimeLeft(new Date(data.payload.closeTime))

        useRoomStore.getState().setRoom({
          id: roomId,
          name: data.payload.roomName,
          closeTime: new Date(data.payload.closeTime),
          isTemporary: data.payload.isTemporary,
        })
      },

      // ── Participant changes ─────────────────────────────────────────────
      user_joined: () => {
        setUsers((prevUsers) => {
          const userExists = prevUsers.some(
            (user) => user.userId === data.payload.userId
          )
          if (userExists) return prevUsers
          return [
            ...prevUsers,
            {
              userId: data.payload.userId,
              username: data.payload.username,
              avatar: data.payload.avatar,
            },
          ]
        })
      },
      user_left: () => {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.userId !== data.payload.userId)
        )
      },

      // ── New message broadcast ───────────────────────────────────────────
      new_message: () => {
        setMessages((prevMessages) => {
          // Deduplicate by id (may arrive for sender too from broadcastToAll)
          if (prevMessages.some((m) => m.id === data.payload.id)) {
            return prevMessages
          }
          return [...prevMessages, data.payload]
        })
      },

      // ── Reaction state update (single source of truth from server) ──────
      reaction_updated: () => {
        setMessages((prevMessages) => {
          const idx = prevMessages.findIndex(
            (msg) => msg.id === data.payload.messageId
          )
          if (idx === -1) return prevMessages

          const newMessages = structuredClone(prevMessages)
          // Replace the entire reaction map with what the server returns
          newMessages[idx]!.reactions = data.payload.reactions

          // Update userEmoji for the current user
          const myEmoji = Object.entries(
            data.payload.reactions as Record<
              string,
              { id: string; name: string; avatar: string }[]
            >
          ).find(([, users]) => users.some((u) => u.id === userId))?.[0]
          newMessages[idx]!.userEmoji = myEmoji ?? ''

          return newMessages
        })
      },

      // ── Self-initiated leave confirmed by server ────────────────────────
      self_leave: () => {
        setShouldConnect(false)
      },
    }

    const handler = handlers[data.type]
    if (handler) handler()
  }, [lastMessage, anonymous, setUserId, userId, roomId])

  // ── Outgoing helpers ──────────────────────────────────────────────────────
  const sendChatMessage = useCallback(
    (content: string, image?: string) => {
      if (anonymous === null || readyState !== ReadyState.OPEN) return
      sendMessage(
        JSON.stringify({
          type: 'send_message',
          payload: { content, ...(image && { image }) },
        })
      )
    },
    [readyState, sendMessage, anonymous]
  )

  const sendReaction = useCallback(
    (messageId: string, emoji: string, currentEmoji?: string) => {
      if (anonymous === null || readyState !== ReadyState.OPEN) return

      if (currentEmoji && currentEmoji === emoji) {
        // Toggle off — remove the reaction
        sendMessage(
          JSON.stringify({
            type: 'remove_reaction',
            payload: { messageId, emoji },
          })
        )
      } else {
        // Remove old reaction first if there was one
        if (currentEmoji) {
          sendMessage(
            JSON.stringify({
              type: 'remove_reaction',
              payload: { messageId, emoji: currentEmoji },
            })
          )
        }
        // Add new reaction
        sendMessage(
          JSON.stringify({
            type: 'react',
            payload: { messageId, emoji },
          })
        )
      }
    },
    [readyState, sendMessage, anonymous]
  )

  const handleExit = useCallback(() => {
    if (readyState === ReadyState.OPEN) {
      sendMessage(JSON.stringify({ type: 'leave', payload: {} }))
      setShouldConnect(false)
    }
    toast.info('Redirecting to dashboard...')
    window.location.href = '/dashboard'
  }, [readyState, sendMessage])

  // ── Render guards ─────────────────────────────────────────────────────────
  if (token && anonymous === null) {
    return <GetAnonomousity />
  }

  if (!token && !tempUser) {
    return (
      <ErrorState
        title="Authentication Error"
        message="No authentication credentials provided. Please log in or continue as guest."
        fullScreen
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        details="Connection Error"
        message="Unable to connect to the chat room. Please try again later."
        title={error}
        fullScreen
      />
    )
  }

  if (isLoading) {
    return <LoadingState fullScreen />
  }

  return (
    <TimeLeftDisplay closeTime={timeLeft} isPublic={roomId == 'public'}>
      <ChatLayout
        roomName={roomName}
        roomId={roomId}
        timeLeft={timeLeft}
        messages={messages}
        sendMessage={sendChatMessage}
        sendReaction={sendReaction}
        handleExit={handleExit}
        readyState={readyState}
        participants={users}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
        activeCluster={activeCluster}
        onClusterSelect={setActiveCluster}
      />
    </TimeLeftDisplay>
  )
}

export default PageClient

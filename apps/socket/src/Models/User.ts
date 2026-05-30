import jwt from 'jsonwebtoken'
import { WebSocket } from 'ws'
import client from '@echo/db/src'
import { Prisma } from '@prisma/client'
import { RoomManager } from './RoomManager'
import { v4 as uuid } from 'uuid'
import { WebSocketMessage } from '../types/index.d'
import * as dotenv from 'dotenv'

dotenv.config()

interface JwtPayload {
  userId: string
}

type RoomMessage = Prisma.MessageGetPayload<{
  select: {
    id: true
    image: true
    content: true
    sentAt: true
    sender: {
      select: {
        user: {
          select: {
            id: true
            name: true
            image: true
          }
        }
        tempUserId: true
        tempUsername: true
        tempUserImage: true
      }
    }
    reaction: {
      select: {
        emoji: true
        sender: {
          select: {
            user: {
              select: {
                id: true
                name: true
                image: true
              }
            }
            tempUserId: true
            tempUsername: true
            tempUserImage: true
          }
        }
      }
    }
  }
}>

type MessageReaction = RoomMessage['reaction'][number]

export class User {
  public id: string
  public name: string
  public avatar: string
  public temporary: boolean
  public roomId: string

  constructor(private ws: WebSocket) {
    this.avatar = ''
    this.name = ''
    this.id = ''
    this.temporary = true
    this.roomId = ''
    this.initHandlers()
  }

  private initHandlers() {
    this.ws.on('message', async (data) => {
      const parsedData = JSON.parse(data.toString())

      switch (parsedData.type) {
        case 'join': {
          const { roomId, token, tempId, tempName, tempAvatar } =
            parsedData.payload

          const room = await client.room.findUnique({
            where: {
              id: roomId,
            },
            include: {
              messages: {
                select: {
                  id: true,
                  image: true,
                  content: true,
                  sender: {
                    select: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          image: true,
                        },
                      },
                      tempUserId: true,
                      tempUsername: true,
                      tempUserImage: true,
                    },
                  },
                  reaction: {
                    select: {
                      emoji: true,
                      sender: {
                        select: {
                          user: {
                            select: {
                              id: true,
                              name: true,
                              image: true,
                            },
                          },
                          tempUserId: true,
                          tempUsername: true,
                          tempUserImage: true,
                        },
                      },
                    },
                  },
                  sentAt: true,
                },
              },
            },
          })

          if (!room) {
            this.ws.send(
              JSON.stringify({
                type: 'error',
                payload: {
                  message: 'Room not found',
                },
              })
            )
            this.ws.close()
            return
          }

          if (room.closedAt && room.closedAt < new Date()) {
            this.ws.send(
              JSON.stringify({
                type: 'error',
                payload: {
                  message: 'Room is closed',
                },
              })
            )
            this.ws.close()
            return
          }

          if (token) {
            try {
              const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your_jwt_secret_key'
              ) as JwtPayload

              if (!decoded.userId) {
                this.ws.close()
                return
              }

              const user = await client.user.findUnique({
                where: {
                  id: decoded.userId,
                },
              })

              if (!user) {
                this.ws.close()
                return
              }

              this.id = user.id
              this.avatar = user.image ?? ''
              this.name = user.name
              this.temporary = false
            } catch (err) {
              this.ws.close()
              return
            }
          } else if (tempId && tempAvatar && tempName) {
            this.avatar = tempAvatar
            this.id = tempId
            this.name = tempName
            this.temporary = true
          } else {
            return
          }

          const existingUser = RoomManager.getInstance()
            .rooms.get(roomId)
            ?.users.find((u) => u.id === this.id)

          if (existingUser) {
            this.send({
              type: 'error',
              payload: {
                message: 'User already exists in room',
              },
            })
            this.ws.close()
            return
          }

          if (
            !(await RoomManager.getInstance().addUser(this, {
              id: room.id,
              isTemporary: room.isTemporary,
              maxTimeLimit: room.maxTimeLimit,
              maxUsers: room.maxUsers,
            }))
          ) {
            this.send({
              type: 'error',
              payload: {
                message: 'Room is full',
              },
            })

            this.ws.close()
            return
          }

          this.roomId = room.id

          RoomManager.getInstance().broadcast(
            {
              type: 'user_joined',
              payload: {
                userId: this.id,
                username: this.name,
                avatar: this.avatar,
                temporary: this.temporary,
              },
            },
            this,
            roomId
          )

          this.send({
            type: 'room_joined',
            payload: {
              userId: this.id,
              participantId: `${room.id}-${this.id}`,
              users: RoomManager.getInstance()
                .rooms.get(roomId)
                ?.users.map((u) => ({
                  userId: u.id,
                  username: u.name,
                  avatar: u.avatar,
                  temporary: u.temporary,
                })),
              maxUsers: room.maxUsers,
              roomName: room.name,
              maxTimeLimit: room.maxTimeLimit,
              closeTime: room.closedAt,
              isTemporary: room.isTemporary,
              lastMessages: room.isTemporary
                ? RoomManager.getInstance()
                    .rooms.get(roomId)
                    ?.lastMessages.map((msg) => ({
                      ...msg,
                      userEmoji:
                        (msg.reactions &&
                          Object.entries<
                            { id: string; name: string; avatar: string }[]
                          >(msg.reactions).find(([, users]) =>
                            users.some((user) => user.id === this.id)
                          )?.[0]) ||
                        '',
                    })) || []
                : room.messages.map((msg: RoomMessage) => ({
                    content: msg.content,
                    id: msg.id,
                    ...(msg.image && { image: msg.image }),
                    userId: msg.sender.user?.id || msg.sender.tempUserId || '',
                    username:
                      msg.sender.user?.name || msg.sender.tempUsername || '',
                    avatar:
                      msg.sender.user?.image || msg.sender.tempUserImage || '',
                    userEmoji:
                      msg.reaction.some(
                        (r: MessageReaction) =>
                          r.sender.user?.id === this.id ||
                          r.sender.tempUserId === this.id
                      ) && msg.reaction[0]?.emoji
                        ? msg.reaction[0].emoji
                        : '',
                    sentAt: msg.sentAt,
                    reactions: msg.reaction.reduce(
                      (
                        reactions: Record<
                          string,
                          { id: string; name: string; avatar: string }[]
                        >,
                        reaction: MessageReaction
                      ) => {
                        if (!reactions[reaction.emoji]) {
                          reactions[reaction.emoji] = []
                        }

                        reactions[reaction.emoji]!.push({
                          id:
                            reaction.sender.user?.id ||
                            reaction.sender.tempUserId ||
                            '',
                          name:
                            reaction.sender.user?.name ||
                            reaction.sender.tempUsername ||
                            '',
                          avatar:
                            reaction.sender.user?.image ||
                            reaction.sender.tempUserImage ||
                            '',
                        })

                        return reactions
                      },
                      {} as Record<
                        string,
                        { id: string; name: string; avatar: string }[]
                      >
                    ),
                  })),
            },
          })
          break
        }
      }
    })

    this.ws.on('close', () => {
      this.destroy()
    })
  }

  public send(data: WebSocketMessage) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  public destroy() {
    if (this.roomId) {
      RoomManager.getInstance().removeUser(this.roomId, this)
      RoomManager.getInstance().broadcast(
        {
          type: 'user_left',
          payload: {
            userId: this.id,
          },
        },
        this,
        this.roomId
      )
      this.send({
        type: 'self-leave',
        payload: {
          userId: this.id,
        },
      })
    }
    this.ws.close()
  }
}

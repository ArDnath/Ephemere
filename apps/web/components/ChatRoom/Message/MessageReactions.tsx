import { Badge } from '@ephemere/ui/components/ui/badge.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ephemere/ui/components/ui/popover.tsx'
import { ScrollArea, ScrollBar } from '@ephemere/ui/components/ui/scroll-area.tsx'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@ephemere/ui/components/ui/tabs.tsx'
import { motion } from 'framer-motion'

import { useIdentityStore } from '@/lib/store/useIdentityStore'
import { Reaction } from '@/types'

import { MessageAvatar } from './MessageAvatar'

type MessageReactionsProps = {
  reactions: Reaction[]
  totalReactions: number
  side?: 'right' | 'left'
}

export const MessageReactions = ({
  reactions,
  totalReactions,
  side,
}: MessageReactionsProps) => {
  const { userId: participantId } = useIdentityStore()
  if (totalReactions === 0) return null

  const renderUsers = (users: Reaction['users'], emoji: string) =>
    users.map((user, index) => (
      <motion.div
        key={user.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2 md:gap-5">
          <MessageAvatar
            avatar={user.avatar}
            showAvatar={true}
            userName={user.id === participantId ? 'You' : user.name}
          />
          <p className="text-xs font-medium text-foreground">
            {user.id === participantId ? 'You' : user.name}
          </p>
        </div>
        <p className="text-lg md:text-2xl">{emoji}</p>
      </motion.div>
    ))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`absolute bottom-0 ${side === 'left' ? 'right-0' : 'left-0'} z-50 mx-1 w-fit translate-y-2/3 rounded-full border border-border bg-background/90 px-1.5 py-0.5 shadow-sm backdrop-blur-sm`}
        >
          <div className="flex items-center justify-center gap-0.5">
            {reactions.slice(0, 3).map((reaction) => (
              <span key={reaction.emoji} className="text-[10px] md:text-xs">
                {reaction.emoji}
              </span>
            ))}
            {totalReactions > 1 && (
              <div className="px-0.5 font-mono text-[10px] text-muted-foreground">
                {totalReactions}
              </div>
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] border border-border bg-background shadow-md max-sm:scale-90 md:w-[320px]">
        <div>
          <Tabs defaultValue="all">
            <ScrollArea>
              <TabsList className="border-border text-foreground mb-2 h-auto rounded-none bg-transparent px-0 py-0.5 md:mb-3 md:py-1">
                <TabsTrigger
                  value="all"
                  className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative px-1 after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none md:px-1.5"
                >
                  All{' '}
                  <Badge className="ms-1 min-w-4 bg-muted px-1 text-foreground md:ms-1.5 md:min-w-5 md:px-1.5" variant="secondary">
                    {totalReactions}
                  </Badge>
                </TabsTrigger>
                {reactions.map((reaction) => (
                  <TabsTrigger
                    key={reaction.emoji}
                    value={reaction.emoji}
                    className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative px-1 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none md:px-1.5"
                  >
                    {reaction.emoji}
                    <Badge className="ms-1 min-w-4 bg-muted px-1 text-foreground md:ms-1.5 md:min-w-5 md:px-1.5" variant="secondary">
                      {reaction.total}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <TabsContent value="all" className="space-y-1 md:space-y-2">
              {reactions.map((reaction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.2 }}
                >
                  {renderUsers(reaction.users, reaction.emoji)}
                </motion.div>
              ))}
            </TabsContent>

            {reactions.map((reaction) => (
              <TabsContent
                key={reaction.emoji}
                value={reaction.emoji}
                className="space-y-1 md:space-y-2"
              >
                {renderUsers(reaction.users, reaction.emoji)}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}

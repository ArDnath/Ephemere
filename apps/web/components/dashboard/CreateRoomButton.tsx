'use client'
import { createRoomSchema } from '@ephemere/lib'
import { Input as Input2 } from '@ephemere/ui/components/ui/input.tsx'
import { Switch } from '@ephemere/ui/components/ui/switch.tsx'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useCallback, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button as Button2 } from '@/components/shared/Button'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { createRooms } from '@/lib/actions/RoomActions'
import { UserStats } from '@/types'

type CreateRoomInput = z.infer<typeof createRoomSchema>

function UsageBar({
  used,
  max,
  label,
}: {
  used: number
  max: number
  label: string
}) {
  const pct = Math.min(100, Math.round((used / max) * 100))
  const isNearLimit = pct >= 80
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/40 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1 w-20 overflow-hidden rounded-full bg-border/60">
          <div
            className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-amber-500' : 'bg-foreground/50'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="min-w-[3rem] text-right text-xs font-medium tabular-nums text-foreground">
          {used} / {max}
        </span>
      </div>
    </div>
  )
}

function NumberStepper({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  variant = 'plusminus',
}: {
  label: string
  hint?: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  variant?: 'plusminus' | 'spinner'
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {variant === 'plusminus' ? (
        <div className="flex h-9 items-center overflow-hidden rounded-lg border border-input bg-background shadow-sm">
          <button
            type="button"
            onClick={() => onChange(clamp(value - 1))}
            disabled={value <= min}
            className="flex aspect-square h-full items-center justify-center border-r border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Decrease ${label}`}
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
          <span className="flex-1 text-center text-sm font-medium tabular-nums text-foreground">
            {value}
          </span>
          <button
            type="button"
            onClick={() => onChange(clamp(value + 1))}
            disabled={value >= max}
            className="flex aspect-square h-full items-center justify-center border-l border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Increase ${label}`}
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div className="flex h-9 items-center overflow-hidden rounded-lg border border-input bg-background shadow-sm">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => onChange(clamp(Number(e.target.value)))}
            className="flex-1 bg-transparent px-3 py-2 text-center text-sm font-medium tabular-nums text-foreground focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="pr-2 text-xs text-muted-foreground">min</span>
          <div className="flex h-full flex-col border-l border-input">
            <button
              type="button"
              onClick={() => onChange(clamp(value + 1))}
              disabled={value >= max}
              className="flex flex-1 w-6 items-center justify-center border-b border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Increase ${label}`}
            >
              <ChevronUp size={11} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => onChange(clamp(value - 1))}
              disabled={value <= min}
              className="flex flex-1 w-6 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Decrease ${label}`}
            >
              <ChevronDown size={11} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function SaveHistoryToggle({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div
      role="presentation"
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3.5 text-left transition-all select-none md:p-4
        ${checked
          ? 'border-ring/50 bg-background shadow-sm ring-1 ring-ring/20'
          : 'border-border/50 bg-muted/30 hover:border-border hover:bg-muted/60'
        }
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <div className="flex-1 cursor-pointer space-y-0.5">
        <p className="text-sm font-medium text-foreground">
          Save chat history{' '}
          <span className="text-xs font-normal text-muted-foreground">
            (recommended)
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Keep a record of this room&apos;s messages to review later
        </p>
      </div>
      <Switch
        id="save-history"
        checked={checked}
        onClick={(event) => event.stopPropagation()}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="h-6 w-11 shrink-0 rounded-full transition-colors
          data-[state=unchecked]:border-2 data-[state=unchecked]:border-foreground/50 data-[state=unchecked]:bg-foreground/10
          data-[state=checked]:bg-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
          disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}

function CreateRoomContent({
  onSubmit,
  form,
  status,
  limits,
  savedRooms,
}: {
  onSubmit: (data: CreateRoomInput) => Promise<void>
  form: ReturnType<typeof useForm<CreateRoomInput>>
  status: string
  limits: UserStats['limits']
  savedRooms: UserStats['savedRooms']
}) {
  const [name, maxUsersValue, maxTimeLimitValue, isTemporary] = useWatch({
    control: form.control,
    name: ['name', 'maxUsers', 'maxTimeLimit', 'isTemporary'],
  })
  const maxUsers = limits?.maxUsers ?? 100
  const maxTime = limits?.maxTimeLimit ?? 200
  const maxSaved = limits?.maxSavedRooms
  const saveDisabled =
    savedRooms !== undefined &&
    maxSaved !== undefined &&
    savedRooms >= maxSaved

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <p className="mb-0.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          New workspace
        </p>
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Create a room
        </h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Room name */}
        <div className="space-y-1.5">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="room-name"
          >
            Room name
          </label>
          <Input2
            id="room-name"
            placeholder="e.g. Product standup, Q4 review…"
            type="text"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/30"
            {...form.register('name')}
            required
          />
        </div>

        {/* Participants + Duration side by side */}
        <div className="grid grid-cols-2 gap-3">
          <NumberStepper
            label="Participants"
            hint={`Max ${maxUsers}`}
            value={maxUsersValue}
            onChange={(v) => form.setValue('maxUsers', v)}
            min={1}
            max={maxUsers}
            variant="plusminus"
          />
          <NumberStepper
            label="Duration"
            hint={`Max ${maxTime} min`}
            value={maxTimeLimitValue}
            onChange={(v) => form.setValue('maxTimeLimit', v)}
            min={1}
            max={maxTime}
            variant="spinner"
          />
        </div>

        {/* Save history toggle */}
        <SaveHistoryToggle
          checked={!isTemporary}
          onCheckedChange={(checked) => form.setValue('isTemporary', !checked)}
          disabled={saveDisabled}
        />

        {/* Usage meter (only if data available) */}
        {savedRooms !== undefined && maxSaved !== undefined && (
          <UsageBar used={savedRooms} max={maxSaved} label="Saved rooms used" />
        )}

        <Button2
          type="submit"
          disabled={status === 'executing' || !name}
          className="w-full"
          isLoading={status === 'executing'}
        >
          Create room
        </Button2>
      </form>
    </div>
  )
}

export default function CreateRoomButton({
  totalRooms,
  limits,
  showStats = true,
  savedRooms,
}: UserStats & { showStats?: boolean }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const form = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      maxUsers: 2,
      maxTimeLimit: 10,
      isTemporary: true,
    },
  })

  const { executeAsync, status } = useAction(createRooms, {
    onSuccess: (result) => {
      if (result.data?.room) {
        toast.success('Room created successfully')
        router.push(`/room/${result.data.room.id}`)
        setOpen(false)
      }
    },
    onError: (error) => {
      console.error('Failed to create room:', error)
      toast.error('Failed to create room')
    },
  })

  const handleOpen = useCallback(() => setOpen(true), [])

  const onSubmit = useCallback(async (data: CreateRoomInput) => {
    await executeAsync({
      name: data.name,
      maxUsers: data.maxUsers,
      maxTimeLimit: data.maxTimeLimit,
      isTemporary: data.isTemporary,
    })
  }, [executeAsync])

  const atLimit =
    totalRooms !== undefined &&
    limits?.maxRooms !== undefined &&
    totalRooms >= limits.maxRooms

  return (
    <>
      <Button2
        className="w-full md:w-auto"
        disabled={atLimit}
        onClick={handleOpen}
      >
        Create room
        {showStats &&
          totalRooms !== undefined &&
          limits?.maxRooms !== undefined && (
            <span
              className={`-me-1 ms-2 inline-flex h-5 items-center rounded border px-1.5 font-[inherit] text-[10px] font-medium tabular-nums
              ${atLimit
                ? 'border-amber-400/40 text-amber-300/80'
                : 'border-primary-foreground/20 text-primary-foreground/50'
              }`}
            >
              {totalRooms}/{limits.maxRooms}
            </span>
          )}
      </Button2>

      <ResponsiveModal title="Create Room" onOpenChange={setOpen} open={open}>
        <CreateRoomContent
          onSubmit={onSubmit}
          form={form}
          status={status}
          limits={limits}
          savedRooms={savedRooms}
        />
      </ResponsiveModal>
    </>
  )
}

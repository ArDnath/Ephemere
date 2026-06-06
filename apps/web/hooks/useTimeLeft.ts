import { useEffect, useState } from 'react'

const emptyTimeLeft = {
  hours: 0,
  minutes: 0,
  seconds: 0,
}

type TimeLeft = typeof emptyTimeLeft

const sameTimeLeft = (left: TimeLeft, right: TimeLeft) =>
  left.hours === right.hours &&
  left.minutes === right.minutes &&
  left.seconds === right.seconds

export const useTimeLeft = (closedAt: Date | null, enabled = true) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const closedAtMs = closedAt?.getTime() ?? null

  useEffect(() => {
    if (!enabled || closedAtMs === null) {
      setTimeLeft(emptyTimeLeft)
      return
    }

    const calculateTimeLeft = () => {
      const diff = closedAtMs - Date.now()
      if (diff <= 0) {
        setTimeLeft((previous) =>
          sameTimeLeft(previous, emptyTimeLeft) ? previous : emptyTimeLeft
        )
        return true
      }

      const nextTimeLeft = {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      }

      setTimeLeft((previous) =>
        sameTimeLeft(previous, nextTimeLeft) ? previous : nextTimeLeft
      )
      return false
    }

    if (calculateTimeLeft()) return

    const timer = setInterval(() => {
      if (calculateTimeLeft()) clearInterval(timer)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [closedAtMs, enabled])

  return timeLeft
}

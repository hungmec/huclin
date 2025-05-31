// ✅ /components/WorkDurationTimer.tsx
"use client"

import { useEffect, useState } from "react"

interface Props {
  initialClockIn?: string | null
}

export function WorkDurationTimer({ initialClockIn }: Props) {
  const [start, setStart] = useState<Date | null>(
    initialClockIn ? new Date(initialClockIn) : null
  )
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!start) return

    const interval = setInterval(() => {
      const now = new Date()
      setDuration(Math.floor((now.getTime() - start.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [start])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  if (!start) return <p className="text-2xl font-mono">00:00:00</p>

  return <p className="text-2xl font-mono">{formatTime(duration)}</p>
}


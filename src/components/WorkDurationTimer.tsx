"use client"

import { useEffect, useState } from "react"

interface Props {
  clockInTime: string | null
  clockOutTime: string | null
  onlyToday?: boolean
}

export function WorkDurationTimer({ clockInTime, clockOutTime, onlyToday = false }: Props) {
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!clockInTime) {
      setDuration(0)
      return
    }

    const start = new Date(clockInTime).getTime()
    const end = clockOutTime ? new Date(clockOutTime).getTime() : Date.now()
    setDuration(end - start)

    if (!clockOutTime) {
      const interval = setInterval(() => {
        setDuration(Date.now() - start)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [clockInTime, clockOutTime])

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="text-xl font-mono">
      {clockInTime ? formatDuration(duration) : "--:--:--"}
    </div>
  )
}

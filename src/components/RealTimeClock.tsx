"use client"

import { useEffect, useState } from "react"

export function RealTimeClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <p className="text-2xl font-mono">
      {time.toLocaleTimeString()}
    </p>
  )
}

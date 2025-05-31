"use client"

import { useEffect, useState } from "react"

export function RealTimeClock() {
  const [time, setTime] = useState<string>("--:--:--")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = now.getHours().toString().padStart(2, "0")
      const m = now.getMinutes().toString().padStart(2, "0")
      const s = now.getSeconds().toString().padStart(2, "0")
      setTime(`${h}:${m}:${s}`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return <span>{time}</span>
}

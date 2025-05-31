"use client" // 👈 phải có dòng này ở đầu tiên

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

export interface TimeLog {
  clock_in_time: string
  clock_out_time: string | null
  created_at: string
}

export function useAttendanceHistory() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [history, setHistory] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    const res = await fetch("/api/attendance/history")
    const data = await res.json()
    if (res.ok) setHistory(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchHistory()

    const channel = supabase
      .channel("attendance-history")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_logs" },
        () => {
          fetchHistory()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { history, loading, refetch: fetchHistory }
}

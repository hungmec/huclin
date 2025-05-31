"use client"

import { useEffect, useState, useTransition } from "react"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { useAttendanceHistory } from "@/hooks/useAttendanceHistory"
import { supabaseBrowser } from "@/lib/supabaseBrowser"
import { formatTime, formatDate } from "@/lib/utils"

const RealTimeClock = dynamic(() => import("@/components/RealTimeClock").then(m => m.RealTimeClock), {
  ssr: false,
  loading: () => <span>--:--:--</span>,
})


interface Props {
  user: {
    id: string
    full_name: string
    email: string
  }
  latestLog: {
    clock_in_time: string | null
    clock_out_time: string | null
  } | null,
  shift: {
    role: string
    shift_type: string
    start_time: string
    end_time: string
  } | null
}

function enableRealtimeDebug() {
  const channel = supabaseBrowser
    .channel("debug-attendance")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "time_logs",
      },
      (payload) => {
        console.log("📡 [Realtime Payload]", payload)
      }
    )
    .subscribe((status) => {
      console.log("✅ Realtime subscription status:", status)
    })

  return () => {
    supabaseBrowser.removeChannel(channel)
    console.log("🔌 Realtime channel removed.")
  }
}

export default function DashboardClient({ user, latestLog, shift }: Props) {
  const [greeting, setGreeting] = useState<string | null>(null)
  const [clockInDisplay, setClockInDisplay] = useState("--:--:--")

  useEffect(() => {
    const hour = new Date().getHours()
    const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    setGreeting(greet)
  }, [])

  const shiftToday = shift || {
    role: "--",
    shift_type: "--",
    start_time: "--:--",
    end_time: "--:--",
  }

  const { history, refetch } = useAttendanceHistory()
  const [isPending, startTransition] = useTransition()
  const [currentLog, setCurrentLog] = useState<typeof latestLog | null>(null)
  const [canClick, setCanClick] = useState(true)
  const [buttonLabel, setButtonLabel] = useState("Clock In")
  const [liveDuration, setLiveDuration] = useState(0)

  useEffect(() => {
    const cleanup = enableRealtimeDebug()
    return () => cleanup()
  }, [])

  useEffect(() => {
    const channel = supabaseBrowser
      .channel("attendance-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "time_logs"
        },
        () => refetch()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [refetch])

  useEffect(() => {
    const today = new Date().toDateString()
    const logsToday = history.filter(log => {
      const logDate = new Date(log.clock_in_time)
      return logDate.toDateString() === today
    })

    const latest = logsToday.find(log => !log.clock_out_time) || logsToday[0] || null
    setCurrentLog(latest)

    const lastActionTime = latest?.clock_out_time || latest?.clock_in_time
    const diff = lastActionTime ? (new Date().getTime() - new Date(lastActionTime).getTime()) : Infinity
    setCanClick(diff >= 60 * 1000)

    const label = !latest || (latest.clock_in_time && latest.clock_out_time)
      ? "Clock In"
      : latest.clock_in_time && !latest.clock_out_time
      ? "Clock Out"
      : "Đã hoàn tất"
    setButtonLabel(label)

    let total = logsToday.reduce((acc, log) => {
      const start = new Date(log.clock_in_time).getTime()
      const end = log.clock_out_time ? new Date(log.clock_out_time).getTime() : Date.now()
      return acc + (end - start)
    }, 0)

    setLiveDuration(total)

    if (latest?.clock_in_time && !latest?.clock_out_time) {
      setClockInDisplay(formatTime(latest.clock_in_time))
    }
  }, [history])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (currentLog?.clock_in_time && !currentLog?.clock_out_time) {
      interval = setInterval(() => {
        const today = new Date().toDateString()
        const logsToday = history.filter(log => {
          const logDate = new Date(log.clock_in_time)
          return logDate.toDateString() === today
        })

        let total = logsToday.reduce((acc, log) => {
          const start = new Date(log.clock_in_time).getTime()
          const end = log.clock_out_time ? new Date(log.clock_out_time).getTime() : Date.now()
          return acc + (end - start)
        }, 0)

        setLiveDuration(total)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentLog, history])

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleClock = () => {
    if (!canClick) return

    const type = !currentLog || (currentLog.clock_in_time && currentLog.clock_out_time)
      ? "clockin"
      : "clockout"

    startTransition(async () => {
      const res = await fetch(`/api/attendance/${type}`, {
        method: "POST",
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Thao tác thất bại. Vui lòng thử lại.")
        return
      }

      const result = await res.json()
      toast.success(type === "clockin" ? "Đã chấm công vào ca" : "Đã chấm công kết thúc ca")
      await refetch()
    })
  }

  const parsedClockIn = currentLog?.clock_in_time ? new Date(currentLog.clock_in_time) : null
  const parsedClockOut = currentLog?.clock_out_time ? new Date(currentLog.clock_out_time) : null

  return (
    <div className="p-4 space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-muted-foreground text-lg">Hi {user.full_name}</h1>
            {greeting && <p className="text-2xl font-bold">{greeting}</p>}
          </div>
          <div className="text-right">
            <p><strong>Vị trí:</strong> {shiftToday.role}</p>
            <p><strong>Ca:</strong> {shiftToday.shift_type}</p>
            <p><strong>{shiftToday.start_time} - {shiftToday.end_time}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white rounded-xl p-4 shadow border">
            <p className="text-muted-foreground text-sm">Giờ vào ca</p>
            <div className="text-2xl font-mono">
              {!parsedClockIn || (parsedClockIn && parsedClockOut) ? (
                <RealTimeClock />
              ) : (
                clockInDisplay
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border">
            <p className="text-muted-foreground text-sm">Thời gian làm việc</p>
            <div className="text-2xl font-mono">{formatDuration(liveDuration)}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={handleClock}
          disabled={isPending || !canClick}
          className={`relative px-8 py-4 rounded-full shadow text-white text-lg font-semibold w-64 flex items-center justify-center transition h-14
            ${!currentLog || (currentLog.clock_in_time && currentLog.clock_out_time)
              ? "bg-blue-600 hover:bg-blue-700"
              : !currentLog.clock_out_time
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-400 cursor-not-allowed"}`}
        >
          <span className={isPending ? "opacity-0" : "opacity-100 transition"}>
            {buttonLabel}
          </span>
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Lịch sử chấm công</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Ngày</th>
                <th className="border px-4 py-2">Giờ vào</th>
                <th className="border px-4 py-2">Giờ ra</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log, index) => {
                const clockIn = new Date(log.clock_in_time)
                const clockOut = log.clock_out_time ? new Date(log.clock_out_time) : null
                return (
                  <tr key={index}>
                    <td className="border px-4 py-2">{formatDate(clockIn)}</td>
                    <td className="border px-4 py-2">{formatTime(clockIn)}</td>
                    <td className="border px-4 py-2">{clockOut ? formatTime(clockOut) : "--"}</td>
                  </tr>
                )
              })}
              {history.length === 0 && (
                <tr>
                  <td className="border px-4 py-2 text-center" colSpan={3}>
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

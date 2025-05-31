"use client"

import { useState, useTransition } from "react"
import { RealTimeClock } from "@/components/RealTimeClock"
import { WorkDurationTimer } from "@/components/WorkDurationTimer"
import { toast } from "sonner"

interface Props {
  user: {
    id: string
    full_name: string
    email: string
  }
  latestLog: {
    clock_in_time: string | null
    clock_out_time: string | null
  } | null
}

export default function DashboardClient({ user, latestLog }: Props) {
  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const shiftToday = {
    role: "Support",
    shift_type: "Morning",
    start_time: "08:00",
    end_time: "12:00",
  }

  const [clockInTime, setClockInTime] = useState(latestLog?.clock_in_time || null)
  const [clockOutTime, setClockOutTime] = useState(latestLog?.clock_out_time || null)
  const [isPending, startTransition] = useTransition()

  const handleClock = () => {
    const type = !clockInTime ? "clockin" : !clockOutTime ? "clockout" : null
    if (!type) return

    startTransition(async () => {
      const res = await fetch(`/api/attendance/${type}`, {
        method: "POST",
      })

      if (!res.ok) {
        toast.error("Thao tác thất bại. Vui lòng thử lại.")
        return
      }

      const now = new Date().toISOString()
      if (type === "clockin") {
        setClockInTime(now)
        toast.success("Đã chấm công vào ca")
      } else {
        setClockOutTime(now)
        toast.success("Đã chấm công kết thúc ca")
      }
    })
  }

  const getButtonLabel = () => {
    if (!clockInTime) return "Clock In"
    if (!clockOutTime) return "Clock Out"
    return "Đã hoàn tất"
  }

  return (
    <div className="p-4 space-y-8">
      {/* Greeting + Shift Info */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Hi {user.full_name}</h1>
          <p className="text-muted-foreground text-lg">{greeting}</p>
        </div>
        <div className="text-right">
          <h2 className="text-md font-semibold mb-1">Ca làm hôm nay</h2>
          <p><strong>Vị trí:</strong> {shiftToday.role}</p>
          <p><strong>Ca:</strong> {shiftToday.shift_type}</p>
          <p><strong>Giờ:</strong> {shiftToday.start_time} - {shiftToday.end_time}</p>
        </div>
      </div>

      {/* ClockInTime + Work Duration */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white rounded-xl p-4 shadow border">
          <p className="text-muted-foreground text-sm">Giờ vào ca</p>
          <div className="text-2xl font-mono">
            {clockInTime ? new Date(clockInTime).toLocaleTimeString() : <RealTimeClock />}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border">
          <p className="text-muted-foreground text-sm">Thời gian làm việc</p>
          <WorkDurationTimer initialClockIn={clockInTime} />
        </div>
      </div>

      {/* Clock Button Centered */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleClock}
          disabled={isPending}
          className={`relative px-8 py-4 rounded-full shadow text-white text-lg font-semibold w-64 flex items-center justify-center transition h-14
            ${!clockInTime ? "bg-blue-600 hover:bg-blue-700" : !clockOutTime ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
          {isPending && (
            <span className="absolute">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </span>
          )}
          <span className={isPending ? "opacity-0" : "opacity-100 transition"}>
            {getButtonLabel()}
          </span>
        </button>
      </div>
    </div>
  )
}

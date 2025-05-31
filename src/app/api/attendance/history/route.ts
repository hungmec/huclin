// ✅ /app/api/attendance/history/route.ts

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  const token = (await cookies()).get("token")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from("time_logs")
    .select("id, clock_in_time, clock_out_time, created_at")
    .eq("user_id", user.id)
    .order("clock_in_time", { ascending: false })

  if (error) {
    console.error("Lỗi lấy lịch sử chấm công:", error)
    return NextResponse.json({ error: "Không thể lấy dữ liệu" }, { status: 500 })
  }

  const result = (data || []).map((log, index, arr) => {
    const clockIn = log.clock_in_time ? new Date(log.clock_in_time) : null
    const clockOut = log.clock_out_time ? new Date(log.clock_out_time) : null
    let totalDuration = null

    if (clockIn && clockOut) {
      totalDuration = Math.floor((clockOut.getTime() - clockIn.getTime()) / 1000)
    }

    return {
      ...log,
      totalDuration,
      clock_in_time: clockIn?.toISOString() || null,
      clock_out_time: clockOut?.toISOString() || null,
    }
  })

  return NextResponse.json(result)
}

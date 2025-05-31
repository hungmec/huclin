import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  const user = token ? verifyToken(token) : null
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
  }

  const user_id = user.id

  // ✅ Tìm log gần nhất chưa clock_out
  const { data: latestLog, error: fetchError } = await supabaseAdmin
    .from("time_logs")
    .select("*")
    .eq("user_id", user_id)
    .is("clock_out_time", null)
    .order("clock_in_time", { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !latestLog) {
    return NextResponse.json({ error: "Không tìm thấy bản ghi vào ca để cập nhật" }, { status: 400 })
  }

  const now = new Date()
  const clockInTime = new Date(latestLog.clock_in_time)
  const timeDiffInSeconds = Math.floor((now.getTime() - clockInTime.getTime()) / 1000)

  // ✅ Kiểm tra thời gian làm việc tối thiểu
  if (timeDiffInSeconds < 60) {
    return NextResponse.json({
      error: "Cần làm việc ít nhất 1 phút trước khi chấm công ra ca."
    }, { status: 400 })
  }

  // ✅ Cập nhật giờ ra ca
  const { error: updateError } = await supabaseAdmin
    .from("time_logs")
    .update({ clock_out_time: now.toISOString() })
    .eq("id", latestLog.id)

  if (updateError) {
    console.error("Lỗi cập nhật giờ ra ca:", updateError)
    return NextResponse.json({ error: "Không thể cập nhật giờ ra ca" }, { status: 500 })
  }

  return NextResponse.json({ message: "Đã chấm công ra ca thành công", clockOutTime: now.toISOString() })
}

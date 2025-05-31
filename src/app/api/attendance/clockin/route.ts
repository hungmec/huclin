import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST() {
  const token = (await cookies()).get("token")?.value
  if (!token) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })

  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: "Token không hợp lệ" }, { status: 401 })

  const now = new Date().toISOString()

  const { error } = await supabaseAdmin.from("time_logs").insert([
    {
      user_id: user.id,
      clock_in_time: now,
    },
  ])

  if (error) {
    console.error("Lỗi clockin:", error)
    return NextResponse.json({ error: "Không thể chấm công" }, { status: 500 })
  }

  return NextResponse.json({ message: "Chấm công thành công", clockInTime: now })
}

// ✅ /lib/actions.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function getLatestLog(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("time_logs")
    .select("*")
    .eq("user_id", userId)
    .order("clock_in_time", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("Lỗi khi lấy log gần nhất:", error)
    return null
  }

  return data
}

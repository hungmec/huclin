import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function getLatestLog(user_id: string) {
  const { data, error } = await supabaseAdmin
    .from("time_logs")
    .select("*")
    .eq("user_id", user_id)
    .order("clock_in_time", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("❌ Error fetching latest log:", error.message)
    return null
  }

  return data
}

export async function getTodayShift(user_id: string) {
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

  const { data, error } = await supabaseAdmin
    .from("shifts")
    .select("role, shift_type, start_time, end_time")
    .eq("user_id", user_id)
    .eq("date", today)
    .maybeSingle()

  if (error) {
    console.error("❌ Error fetching today's shift:", error.message)
    return null
  }

  return data
}

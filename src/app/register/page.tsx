const { data: shift } = await supabaseAdmin
  .from("shifts")
  .select("role, shift_type, start_time, end_time")
  .eq("user_id", user_id)
  .eq("date", today)
  .maybeSingle()

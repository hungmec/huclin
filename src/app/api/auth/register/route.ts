// ✅ /app/api/auth/register/route.ts
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  const { full_name, email, phone, address, password } = await req.json()

  if (!email || !password || !full_name || !phone || !address) {
    return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 })
  }

  // ✅ Check email đã tồn tại chưa
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (existingUser) {
    return NextResponse.json({ message: "Email đã tồn tại" }, { status: 400 })
  }

  // ✅ Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10)

  // ✅ Lưu vào bảng users
  const { error: insertError } = await supabase.from("users").insert([
    {
      full_name,
      email,
      phone,
      address,
      password: hashedPassword,
      role: "employee",
    },
  ])

  if (insertError) {
    console.error("Lỗi insert:", insertError)
    return NextResponse.json({ message: "Không thể đăng ký" }, { status: 500 })
  }

  return NextResponse.json({ message: "Đăng ký thành công" })
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Thiếu email hoặc mật khẩu" }, { status: 400 })
    }

    // ✅ Tìm người dùng theo email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (error || !user) {
      return NextResponse.json({ message: "Email không tồn tại" }, { status: 401 })
    }

    // ✅ So sánh password đã mã hoá
    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Mật khẩu không đúng" }, { status: 401 })
    }

    // ✅ Tạo JWT token chứa thông tin người dùng
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role || "user",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    // ✅ Lưu vào cookie
    cookies().set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return NextResponse.json({ message: "Đăng nhập thành công" })
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 })
  }
}

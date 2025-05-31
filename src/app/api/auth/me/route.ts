import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { headers } from "next/headers"
import cookie from "cookie" // Nếu chưa cài: npm install cookie

export async function GET(request: NextRequest) {
  try {
    const headerList = await headers()
    const cookieHeader = headerList.get("cookie") || ""
    const parsedCookies = cookie.parse(cookieHeader)
    const token = parsedCookies.token

    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Token không hợp lệ hoặc hết hạn" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error("Lỗi xác thực:", err)
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 })
  }
}

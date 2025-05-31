// ✅ middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { decode } from "jsonwebtoken"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  // Không có token → redirect
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    // ✅ Có thể xác thực thêm bằng decode hoặc Supabase
    const decoded = decode(token)

    if (!decoded || typeof decoded !== "object" || !decoded?.id) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Bạn cũng có thể kiểm tra thêm quyền hạn, expired v.v...

    return NextResponse.next()
  } catch (err) {
    console.error("Lỗi xác thực middleware:", err)
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

// ✅ middleware.ts (thêm vào cuối)
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"], // bất kỳ path nào bạn cần bảo vệ
}

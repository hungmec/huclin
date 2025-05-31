import { NextResponse } from "next/server"

export async function GET() {
  const response = NextResponse.redirect("/login")

  // Xóa cookie bằng cách đặt giá trị rỗng và maxAge = 0
  response.cookies.set("token", "", {
    path: "/",
    maxAge: 0,
  })

  return response
}

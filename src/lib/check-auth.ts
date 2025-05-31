// ✅ /src/lib/check-auth.ts
import { headers } from "next/headers"
import cookie from "cookie"
import { verifyToken } from "./auth"

export async function getCurrentUser() {
  const headerList = await headers()
  const cookieHeader = headerList.get("cookie") || ""
  const parsedCookies = cookie.parse(cookieHeader)
  const token = parsedCookies.token
  const user = token ? verifyToken(token) : null
  return user
}

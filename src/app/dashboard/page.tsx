// ✅ app/dashboard/page.tsx
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import cookie from "cookie"
import { verifyToken } from "@/lib/auth"
import { getLatestLog } from "@/lib/actions"
import DashboardClient from "@/components/DashboardClient"

export default async function DashboardPage() {
  const headerList = headers()
  const cookieHeader = (await headerList).get("cookie") || ""
  const parsedCookies = cookie.parse(cookieHeader)
  const token = parsedCookies.token

  const user = token ? verifyToken(token) : null

  // ✅ Thêm dòng debug
  console.log("👉 User sau khi verify:", user)

  if (!user) redirect("/login")

  const latestLog = await getLatestLog(user.id)

  return <DashboardClient user={user} latestLog={latestLog} />
}

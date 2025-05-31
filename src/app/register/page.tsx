// ✅ /app/register/page.tsx
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/check-auth"
import AuthForm from "@/components/AuthForm"

export default async function RegisterPage() {
  const user = getCurrentUser()
  if (await user) redirect("/dashboard")

  return <AuthForm type="register" />
}

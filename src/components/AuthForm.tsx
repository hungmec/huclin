"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AuthFormProps {
  type: "login" | "register"
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (type === "register") {
      if (form.password !== form.confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp")
        setLoading(false)
        return
      }
    }

    try {
      // ✅ Tạo ID giả lập nếu là login
      const payload = {
        ...form,
        id:
          type === "login"
            ? "user_" + Math.random().toString(36).substring(2, 10)
            : undefined,
      }

      const res = await fetch(`/api/auth/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || "Đã xảy ra lỗi")
        setLoading(false)
        return
      }

      toast.success(`${type === "login" ? "Đăng nhập" : "Đăng ký"} thành công`)
      router.push("/dashboard")
    } catch (err) {
      console.error(err)
      toast.error("Đã xảy ra lỗi mạng")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-4">
      <h2 className="text-2xl font-bold text-center">
        {type === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
      </h2>

      {type === "register" && (
        <>
          <Input
            name="full_name"
            placeholder="Họ tên"
            value={form.full_name}
            onChange={handleChange}
            required
          />
          <Input
            name="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <Input
            name="address"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={handleChange}
            required
          />
        </>
      )}

      <Input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <Input
        name="password"
        type="password"
        placeholder="Mật khẩu"
        value={form.password}
        onChange={handleChange}
        required
      />

      {type === "register" && (
        <Input
          name="confirmPassword"
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Đang xử lý..." : type === "login" ? "Đăng nhập" : "Đăng ký"}
      </Button>

      <div className="text-center text-sm mt-4">
        {type === "login" ? (
          <>
            Bạn chưa có tài khoản?{" "}
            <a href="/register" className="underline text-blue-600 hover:text-blue-800">
              Đăng ký
            </a>
          </>
        ) : (
          <>
            Bạn đã có tài khoản?{" "}
            <a href="/login" className="underline text-blue-600 hover:text-blue-800">
              Đăng nhập
            </a>
          </>
        )}
      </div>
    </form>
  )
}

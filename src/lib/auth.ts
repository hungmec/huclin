import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "R@pKjd82Z!bMcq9s0vFt7Ek^uTPmxN3z"

interface UserPayload {
  id: string
  full_name: string
  email: string
}

// ✅ Tạo JWT token từ thông tin user
export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }) // token hết hạn sau 7 ngày
}

// ✅ Giải mã token để lấy thông tin user
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch (error) {
    console.error("❌ JWT verification failed:", error)
    return null
  }
}

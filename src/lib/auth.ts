// lib/auth.ts
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    id: string
    email: string
    full_name: string
    role: string
  }
}

// ✅ lib/utils.ts
export function formatTime(date: string | Date): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleTimeString()
  } catch {
    return "--:--"
  }
}

export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString()
  } catch {
    return "--/--/----"
  }
}
// ✅ Tailwind class merge utility
export function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ")
}

// ✅ /lib/supabaseBrowser.ts

import { createBrowserClient } from "@supabase/ssr"

console.log("✅ Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("✅ Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 6), "...")


export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


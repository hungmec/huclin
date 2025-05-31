// types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      time_logs: {
        Row: {
          id: number
          user_id: string
          clock_in_time: string
          clock_out_time: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          clock_in_time: string
          clock_out_time?: string | null
          created_at?: string
        }
        Update: {
          clock_out_time?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
  }
}

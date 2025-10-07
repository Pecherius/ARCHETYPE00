import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Types for our database
export interface Raffle {
  id: string
  title: string
  description?: string
  image_url?: string
  status: "active" | "completed" | "paused"
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  raffle_id: string
  name: string
  tickets: number
  up_address?: string
  color: string
  created_at: string
}

export interface Prize {
  id: string
  raffle_id: string
  name: string
  count: number
  remaining: number
  created_at: string
}

export interface Winner {
  id: string
  raffle_id: string
  participant_id: string
  prize_id: string
  participant_name: string
  prize_name: string
  participant_color: string
  up_address?: string
  won_at: string
}

// Lazy initialization of Supabase client
let _supabase: SupabaseClient | null = null
let _initialized = false

export function getSupabase(): SupabaseClient | null {
  if (_initialized) {
    return _supabase
  }

  _initialized = true

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("🔍 Supabase environment variables not found")
      console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Found" : "❌ Missing")
      console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Found" : "❌ Missing")
      _supabase = null
      return null
    }

    console.log("✅ Initializing Supabase client")
    console.log("Using URL:", supabaseUrl)

    _supabase = createClient(supabaseUrl, supabaseAnonKey)
    return _supabase
  } catch (error) {
    console.error("❌ Error initializing Supabase:", error)
    _supabase = null
    return null
  }
}

// Export a getter function instead of the client directly
export const supabase = getSupabase()

// Helper function to check if Supabase is available
export function isSupabaseAvailable(): boolean {
  return getSupabase() !== null
}

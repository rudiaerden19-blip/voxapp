import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

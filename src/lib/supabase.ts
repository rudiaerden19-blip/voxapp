import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bkjqadaamxmwjeenzslr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJranFhZGFhbXhtd2plZW56c2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDE4ODYsImV4cCI6MjA4NjQxNzg4Nn0.S150ziiXSs_TH9TsktOTmWuidi9gNwho6naAjZkUjyY'

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

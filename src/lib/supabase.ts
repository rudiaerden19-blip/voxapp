import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

// Database types voor Supabase
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

interface Database {
  public: {
    Tables: {
      businesses: {
        Row: { id: string; user_id: string; name: string; type: string; phone: string | null; email: string | null; address: string | null; opening_hours: Json | null; subscription_status: string; subscription_plan: string | null; trial_ends_at: string | null; elevenlabs_agent_id: string | null; stripe_customer_id: string | null; stripe_subscription_id: string | null; blocked: boolean | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; type: string; phone?: string | null; email?: string | null; address?: string | null; opening_hours?: Json | null; subscription_status?: string; subscription_plan?: string | null; trial_ends_at?: string | null; elevenlabs_agent_id?: string | null; stripe_customer_id?: string | null; stripe_subscription_id?: string | null; blocked?: boolean | null; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; name?: string; type?: string; phone?: string | null; email?: string | null; address?: string | null; opening_hours?: Json | null; subscription_status?: string; subscription_plan?: string | null; trial_ends_at?: string | null; elevenlabs_agent_id?: string | null; stripe_customer_id?: string | null; stripe_subscription_id?: string | null; blocked?: boolean | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      services: {
        Row: { id: string; business_id: string; name: string; description: string | null; duration_minutes: number; price: number | null; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; business_id: string; name: string; description?: string | null; duration_minutes: number; price?: number | null; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; business_id?: string; name?: string; description?: string | null; duration_minutes?: number; price?: number | null; is_active?: boolean; created_at?: string; updated_at?: string }
        Relationships: []
      }
      staff: {
        Row: { id: string; business_id: string; name: string; email: string | null; phone: string | null; working_hours: Json | null; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; business_id: string; name: string; email?: string | null; phone?: string | null; working_hours?: Json | null; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; business_id?: string; name?: string; email?: string | null; phone?: string | null; working_hours?: Json | null; is_active?: boolean; created_at?: string; updated_at?: string }
        Relationships: []
      }
      appointments: {
        Row: { id: string; business_id: string; service_id: string | null; staff_id: string | null; customer_name: string; customer_phone: string | null; customer_email: string | null; start_time: string; end_time: string; status: string; notes: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; business_id: string; service_id?: string | null; staff_id?: string | null; customer_name: string; customer_phone?: string | null; customer_email?: string | null; start_time: string; end_time: string; status?: string; notes?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; business_id?: string; service_id?: string | null; staff_id?: string | null; customer_name?: string; customer_phone?: string | null; customer_email?: string | null; start_time?: string; end_time?: string; status?: string; notes?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "appointments_service_id_fkey"; columns: ["service_id"]; isOneToOne: false; referencedRelation: "services"; referencedColumns: ["id"] },
          { foreignKeyName: "appointments_staff_id_fkey"; columns: ["staff_id"]; isOneToOne: false; referencedRelation: "staff"; referencedColumns: ["id"] },
          { foreignKeyName: "appointments_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] }
        ]
      }
      conversations: {
        Row: { id: string; business_id: string; caller_phone: string | null; transcript: string | null; summary: string | null; action_taken: string | null; appointment_id: string | null; duration_seconds: number | null; created_at: string }
        Insert: { id?: string; business_id: string; caller_phone?: string | null; transcript?: string | null; summary?: string | null; action_taken?: string | null; appointment_id?: string | null; duration_seconds?: number | null; created_at?: string }
        Update: { id?: string; business_id?: string; caller_phone?: string | null; transcript?: string | null; summary?: string | null; action_taken?: string | null; appointment_id?: string | null; duration_seconds?: number | null; created_at?: string }
        Relationships: []
      }
      menu_items: {
        Row: { id: string; business_id: string; name: string; description: string | null; price: number; category: string | null; is_available: boolean; sort_order: number; is_popular: boolean; is_promo: boolean; promo_price: number | null; duration_minutes: number | null; image_url: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; business_id: string; name: string; description?: string | null; price: number; category?: string | null; is_available?: boolean; sort_order?: number; is_popular?: boolean; is_promo?: boolean; promo_price?: number | null; duration_minutes?: number | null; image_url?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; business_id?: string; name?: string; description?: string | null; price?: number; category?: string | null; is_available?: boolean; sort_order?: number; is_popular?: boolean; is_promo?: boolean; promo_price?: number | null; duration_minutes?: number | null; image_url?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      orders: {
        Row: { id: string; business_id: string; customer_name: string; customer_phone: string | null; status: string; total_amount: number; pickup_time: string | null; notes: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; business_id: string; customer_name: string; customer_phone?: string | null; status?: string; total_amount: number; pickup_time?: string | null; notes?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; business_id?: string; customer_name?: string; customer_phone?: string | null; status?: string; total_amount?: number; pickup_time?: string | null; notes?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      order_items: {
        Row: { id: string; order_id: string; menu_item_id: string; quantity: number; unit_price: number; created_at: string }
        Insert: { id?: string; order_id: string; menu_item_id: string; quantity: number; unit_price: number; created_at?: string }
        Update: { id?: string; order_id?: string; menu_item_id?: string; quantity?: number; unit_price?: number; created_at?: string }
        Relationships: []
      }
      option_groups: {
        Row: { id: string; business_id: string; name: string; type: string; required: boolean; sort_order: number; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; business_id: string; name: string; type?: string; required?: boolean; sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; business_id?: string; name?: string; type?: string; required?: boolean; sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string }
        Relationships: []
      }
      option_choices: {
        Row: { id: string; option_group_id: string; business_id: string; name: string; price: number; sort_order: number; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; option_group_id: string; business_id: string; name: string; price?: number; sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; option_group_id?: string; business_id?: string; name?: string; price?: number; sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string }
        Relationships: []
      }
      product_option_links: {
        Row: { id: string; menu_item_id: string; option_group_id: string; business_id: string; created_at: string }
        Insert: { id?: string; menu_item_id: string; option_group_id: string; business_id: string; created_at?: string }
        Update: { id?: string; menu_item_id?: string; option_group_id?: string; business_id?: string; created_at?: string }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export function createClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

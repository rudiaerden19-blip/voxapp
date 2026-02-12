// Database types voor Supabase
// Deze types komen overeen met het schema in supabase-schema.sql

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: Business;
        Insert: Omit<Business, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Business, 'id'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Service, 'id'>>;
      };
      staff: {
        Row: Staff;
        Insert: Omit<Staff, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Staff, 'id'>>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Appointment, 'id'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at'>;
        Update: Partial<Omit<Conversation, 'id'>>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MenuItem, 'id'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
    };
  };
}

// Business/Tenant
export interface Business {
  id: string;
  user_id: string;
  name: string;
  type: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  opening_hours: OpeningHours | null;
  agent_id: string | null;
  voice_id: string | null;
  welcome_message: string | null;
  subscription_status: 'trial' | 'active' | 'cancelled';
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpeningHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

// Service
export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Staff
export interface Staff {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  working_hours: WorkingHours | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    working: boolean;
  };
}

// Appointment
export interface Appointment {
  id: string;
  business_id: string;
  service_id: string | null;
  staff_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  booked_by: 'ai' | 'manual' | 'online';
  confirmation_sent: boolean;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

// Appointment with joined service data
export interface AppointmentWithService extends Appointment {
  services: { name: string } | null;
}

// Conversation
export interface Conversation {
  id: string;
  business_id: string;
  elevenlabs_conversation_id: string | null;
  customer_phone: string | null;
  duration_seconds: number | null;
  appointment_id: string | null;
  order_id: string | null;
  transcript: Record<string, unknown> | null;
  status: 'completed' | 'failed' | 'dropped';
  created_at: string;
}

// Menu Item (horeca)
export interface MenuItem {
  id: string;
  business_id: string;
  category: string | null;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Order (horeca)
export interface Order {
  id: string;
  business_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  order_type: 'pickup' | 'delivery';
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number | null;
  notes: string | null;
  estimated_ready_time: string | null;
  confirmation_sent: boolean;
  ready_notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

// Order Item
export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  created_at: string;
}

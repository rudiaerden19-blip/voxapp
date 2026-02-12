-- VoxApp Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BUSINESSES (Tenants/Bedrijven)
-- ============================================
CREATE TABLE businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Bedrijfsgegevens
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'salon', 'garage', 'restaurant', 'doctor', 'dentist', etc.
  description TEXT,
  
  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Adres
  street VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(50) DEFAULT 'België',
  
  -- Openingsuren (JSON)
  opening_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "09:00", "close": "16:00", "closed": false},
    "sunday": {"open": "09:00", "close": "16:00", "closed": true}
  }'::jsonb,
  
  -- AI Agent settings
  agent_id VARCHAR(100), -- ElevenLabs agent ID
  voice_id VARCHAR(100), -- ElevenLabs voice ID
  welcome_message TEXT DEFAULT 'Goedemiddag, waarmee kan ik u helpen?',
  
  -- Subscription
  subscription_status VARCHAR(20) DEFAULT 'trial', -- 'trial', 'active', 'cancelled'
  subscription_plan VARCHAR(20) DEFAULT 'starter', -- 'starter', 'professional', 'enterprise'
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICES (Diensten per bedrijf)
-- ============================================
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10,2),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STAFF (Medewerkers per bedrijf)
-- ============================================
CREATE TABLE staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Werkuren (JSON, per dag)
  working_hours JSONB,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS (Afspraken)
-- ============================================
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  
  -- Klantgegevens
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  
  -- Afspraak details
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
  notes TEXT,
  
  -- Hoe geboekt
  booked_by VARCHAR(20) DEFAULT 'ai', -- 'ai', 'manual', 'online'
  
  -- SMS status
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MENU ITEMS (Voor horeca)
-- ============================================
CREATE TABLE menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  category VARCHAR(100), -- 'frietjes', 'snacks', 'dranken', etc.
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  
  is_available BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS (Bestellingen voor horeca)
-- ============================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Klantgegevens
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Order details
  order_type VARCHAR(20) DEFAULT 'pickup', -- 'pickup', 'delivery'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'completed', 'cancelled'
  
  total_amount DECIMAL(10,2),
  notes TEXT,
  
  -- Timing
  estimated_ready_time TIMESTAMP WITH TIME ZONE,
  
  -- SMS status
  confirmation_sent BOOLEAN DEFAULT false,
  ready_notification_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS (Items per bestelling)
-- ============================================
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  
  name VARCHAR(255) NOT NULL, -- Copy of menu item name
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  notes TEXT, -- Special requests
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONVERSATION LOGS (Gespreksgeschiedenis)
-- ============================================
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  elevenlabs_conversation_id VARCHAR(100),
  
  customer_phone VARCHAR(20),
  duration_seconds INTEGER,
  
  -- Linked records
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Transcript
  transcript JSONB,
  
  -- Metadata
  status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'failed', 'dropped'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own business data
CREATE POLICY "Users can view own business" ON businesses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own services" ON services
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own staff" ON staff
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own appointments" ON appointments
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own menu items" ON menu_items
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own orders" ON orders
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own order items" ON order_items
  FOR ALL USING (order_id IN (SELECT id FROM orders WHERE business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())));

CREATE POLICY "Users can view own conversations" ON conversations
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- INDEXES (Voor performance)
-- ============================================
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_services_business_id ON services(business_id);
CREATE INDEX idx_staff_business_id ON staff(business_id);
CREATE INDEX idx_appointments_business_id ON appointments(business_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX idx_orders_business_id ON orders(business_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_conversations_business_id ON conversations(business_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

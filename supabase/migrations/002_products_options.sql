-- VoxApp: Producten & Opties Systeem
-- Migratie voor producten, optiegroepen en keuzes
-- Run dit in Supabase SQL Editor

-- ============================================
-- MENU ITEMS / PRODUCTEN (uitgebreid)
-- ============================================

-- Voeg extra kolommen toe aan bestaande menu_items tabel
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promo_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER, -- Voor kappers/diensten
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================
-- OPTIE GROEPEN (bijv. Sauzen, Maten, Extras)
-- ============================================
CREATE TABLE IF NOT EXISTS option_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,  -- "Sauzen", "Maten", "Extra's"
  type VARCHAR(20) DEFAULT 'multiple',  -- 'single' of 'multiple'
  required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- OPTIE KEUZES (bijv. Mayo €0, Curry €0.50)
-- ============================================
CREATE TABLE IF NOT EXISTS option_choices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  option_group_id UUID REFERENCES option_groups(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,  -- "Mayonaise", "Curry", "Extra kaas"
  price DECIMAL(10,2) DEFAULT 0,  -- 0 = gratis, >0 = betalend
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRODUCT-OPTIE KOPPELING
-- ============================================
CREATE TABLE IF NOT EXISTS product_option_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  option_group_id UUID REFERENCES option_groups(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unieke combinatie
  UNIQUE(menu_item_id, option_group_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_links ENABLE ROW LEVEL SECURITY;

-- Policies voor option_groups
CREATE POLICY "Users can view own option groups" ON option_groups
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Policies voor option_choices
CREATE POLICY "Users can view own option choices" ON option_choices
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Policies voor product_option_links
CREATE POLICY "Users can view own product option links" ON product_option_links
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_option_groups_business_id ON option_groups(business_id);
CREATE INDEX IF NOT EXISTS idx_option_choices_group_id ON option_choices(option_group_id);
CREATE INDEX IF NOT EXISTS idx_option_choices_business_id ON option_choices(business_id);
CREATE INDEX IF NOT EXISTS idx_product_option_links_menu_item ON product_option_links(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_product_option_links_option_group ON product_option_links(option_group_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);

-- ============================================
-- TRIGGERS voor updated_at
-- ============================================
CREATE TRIGGER update_option_groups_updated_at BEFORE UPDATE ON option_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_option_choices_updated_at BEFORE UPDATE ON option_choices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATIE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Migratie voltooid!';
  RAISE NOTICE 'Nieuwe tabellen: option_groups, option_choices, product_option_links';
  RAISE NOTICE 'Uitgebreide kolommen in menu_items: sort_order, is_popular, is_promo, promo_price, duration_minutes, image_url';
END $$;

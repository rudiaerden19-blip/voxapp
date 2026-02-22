-- ============================================
-- BUSINESS INFO (specifieke bedrijfsinformatie per tenant)
-- ============================================

CREATE TABLE IF NOT EXISTS business_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  -- Contact
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Openingstijden als JSON
  opening_hours JSONB DEFAULT '{
    "maandag": "08:00 - 18:00",
    "dinsdag": "08:00 - 18:00",
    "woensdag": "08:00 - 18:00",
    "donderdag": "08:00 - 18:00",
    "vrijdag": "08:00 - 18:00",
    "zaterdag": "Gesloten",
    "zondag": "Gesloten"
  }'::jsonb,
  
  -- Prijslijst (vrije tekst, één per regel)
  price_list TEXT,
  
  -- Services (vrije tekst)
  services TEXT,
  
  -- Extra info
  extra_info TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_business_info_business_id ON business_info(business_id);

-- RLS
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;

-- Users kunnen hun eigen info zien en bewerken
CREATE POLICY "Users can view own business_info" ON business_info
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own business_info" ON business_info
  FOR INSERT WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business_info" ON business_info
  FOR UPDATE USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Service role heeft volledige toegang
CREATE POLICY "Service role full access business_info" ON business_info
  FOR ALL USING (auth.role() = 'service_role');

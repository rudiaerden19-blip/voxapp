-- Phone numbers table: Twilio (or other provider) numbers per business
-- Used by /api/twilio/numbers and /api/twilio/outbound
-- pool_numbers (in 20260216) is separate: shared pool for forwarding

CREATE TABLE IF NOT EXISTS phone_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    twilio_sid TEXT,
    elevenlabs_phone_id TEXT,
    agent_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'released')),
    country TEXT DEFAULT 'BE',
    monthly_cost DECIMAL(10,2) DEFAULT 1.50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(phone_number)
);

CREATE INDEX IF NOT EXISTS idx_phone_numbers_business_id ON phone_numbers(business_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_status ON phone_numbers(status);

ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business phone numbers"
    ON phone_numbers FOR ALL
    USING (
        business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON phone_numbers TO authenticated;

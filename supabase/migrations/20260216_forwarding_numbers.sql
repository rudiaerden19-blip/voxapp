-- Forwarding numbers table - maps customer phone numbers to businesses
-- Used when customers forward their existing numbers to VoxApp's pool numbers

CREATE TABLE IF NOT EXISTS forwarding_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL UNIQUE, -- The customer's existing phone number (E.164 format)
    pool_number_id UUID REFERENCES phone_numbers(id), -- Which VoxApp pool number it forwards to
    forwarding_type TEXT DEFAULT 'all' CHECK (forwarding_type IN ('all', 'busy', 'no_answer', 'unavailable')),
    is_active BOOLEAN DEFAULT true,
    verified_at TIMESTAMPTZ, -- When we confirmed forwarding is working
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pool numbers table - VoxApp's shared numbers that receive forwarded calls
CREATE TABLE IF NOT EXISTS pool_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL UNIQUE,
    provider TEXT DEFAULT 'didww', -- didww, twilio, etc.
    sip_trunk_id TEXT, -- Provider's SIP trunk identifier
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    country TEXT DEFAULT 'BE',
    monthly_cost DECIMAL(10,2) DEFAULT 3.00,
    max_concurrent_calls INTEGER DEFAULT 10,
    current_call_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forwarding_numbers_business ON forwarding_numbers(business_id);
CREATE INDEX IF NOT EXISTS idx_forwarding_numbers_phone ON forwarding_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_pool_numbers_status ON pool_numbers(status);

-- RLS policies
ALTER TABLE forwarding_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_numbers ENABLE ROW LEVEL SECURITY;

-- Users can view their own forwarding numbers
CREATE POLICY "Users can view own forwarding numbers"
    ON forwarding_numbers FOR SELECT
    USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

-- Users can manage their own forwarding numbers
CREATE POLICY "Users can manage own forwarding numbers"
    ON forwarding_numbers FOR ALL
    USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

-- Pool numbers are viewable but not editable by users
CREATE POLICY "Users can view pool numbers"
    ON pool_numbers FOR SELECT
    USING (status = 'active');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON forwarding_numbers TO authenticated;
GRANT SELECT ON pool_numbers TO authenticated;

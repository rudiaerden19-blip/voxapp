-- Usage tracking tables for VoxApp

-- Call logs table - stores every call with duration
CREATE TABLE IF NOT EXISTS call_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    conversation_id TEXT,
    agent_id TEXT,
    duration_seconds INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    caller_phone TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'missed', 'transferred')),
    transcript TEXT,
    summary TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly usage aggregation
CREATE TABLE IF NOT EXISTS usage_monthly (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: YYYY-MM
    total_calls INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    included_minutes INTEGER DEFAULT 375,
    extra_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, month)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_call_logs_business_id ON call_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_business_date ON call_logs(business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_monthly_business ON usage_monthly(business_id);
CREATE INDEX IF NOT EXISTS idx_usage_monthly_month ON usage_monthly(month);

-- RLS policies
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_monthly ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own call logs
CREATE POLICY "Users can view own call logs"
    ON call_logs FOR SELECT
    USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

-- Policy: Service role can insert call logs (for webhooks)
CREATE POLICY "Service role can insert call logs"
    ON call_logs FOR INSERT
    WITH CHECK (true);

-- Policy: Users can view their own usage
CREATE POLICY "Users can view own usage"
    ON usage_monthly FOR SELECT
    USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

-- Policy: Service role can manage usage
CREATE POLICY "Service role can manage usage"
    ON usage_monthly FOR ALL
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON call_logs TO authenticated;
GRANT SELECT ON usage_monthly TO authenticated;

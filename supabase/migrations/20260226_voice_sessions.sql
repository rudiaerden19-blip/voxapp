-- Voice Order Engine: sessies per actieve call
-- Geen VAPI. Telnyx Call Control → onze state machine.

CREATE TABLE IF NOT EXISTS voice_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_control_id   TEXT NOT NULL UNIQUE,
  business_id       UUID NOT NULL REFERENCES businesses(id),
  state             TEXT NOT NULL DEFAULT 'GREETING',
  order_items       JSONB NOT NULL DEFAULT '[]',
  delivery_type     TEXT CHECK (delivery_type IN ('pickup', 'delivery')),
  customer_name     TEXT,
  delivery_address  TEXT,
  caller_phone      TEXT,
  business_name     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_call_control_id ON voice_sessions(call_control_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_business_id ON voice_sessions(business_id);

ALTER TABLE voice_sessions DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_voice_sessions_updated_at
  BEFORE UPDATE ON voice_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vapi assistant ID voor business lookup bij tool-calls
-- Wanneer je Vapi gebruikt voor calls, zet hier het Vapi assistant ID
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS vapi_assistant_id TEXT;

CREATE INDEX IF NOT EXISTS idx_businesses_vapi_assistant_id ON businesses(vapi_assistant_id) WHERE vapi_assistant_id IS NOT NULL;

COMMENT ON COLUMN businesses.vapi_assistant_id IS 'Vapi assistant ID - gebruikt voor lookup bij appointments/save tool-call';

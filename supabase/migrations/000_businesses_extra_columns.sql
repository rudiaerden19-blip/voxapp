-- Extra kolommen op businesses die de app gebruikt (naast agent_id/voice_id uit basis-schema)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS elevenlabs_agent_id TEXT,
  ADD COLUMN IF NOT EXISTS ai_phone_number TEXT;

CREATE INDEX IF NOT EXISTS idx_businesses_elevenlabs_agent_id ON businesses(elevenlabs_agent_id) WHERE elevenlabs_agent_id IS NOT NULL;

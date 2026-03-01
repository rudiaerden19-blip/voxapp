-- Voeg appointment-engine kolommen toe aan voice_sessions
-- De tabel wordt nu ook gebruikt voor afspraak-gesprekken (naast orders)

ALTER TABLE voice_sessions
  ADD COLUMN IF NOT EXISTS conversation_id TEXT,
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS collected_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS retries JSONB DEFAULT '{}';

-- conversation_id wordt de primaire lookup key voor de appointment engine
CREATE UNIQUE INDEX IF NOT EXISTS idx_voice_sessions_conversation_id
  ON voice_sessions(conversation_id) WHERE conversation_id IS NOT NULL;

-- call_control_id nullable maken zodat appointment-engine sessies
-- (die geen Telnyx call_control_id hebben) ook opgeslagen kunnen worden.
ALTER TABLE voice_sessions ALTER COLUMN call_control_id DROP NOT NULL;

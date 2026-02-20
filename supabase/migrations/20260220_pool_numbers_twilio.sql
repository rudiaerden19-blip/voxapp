-- Add Twilio support and default agent to pool_numbers
-- Run this in Supabase SQL Editor

-- Add columns for Twilio integration
ALTER TABLE pool_numbers 
ADD COLUMN IF NOT EXISTS twilio_sid TEXT,
ADD COLUMN IF NOT EXISTS default_agent_id TEXT,
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Update provider check to include twilio
ALTER TABLE pool_numbers 
DROP CONSTRAINT IF EXISTS pool_numbers_provider_check;

ALTER TABLE pool_numbers 
ADD CONSTRAINT pool_numbers_provider_check 
CHECK (provider IN ('didww', 'twilio', 'telnyx', 'dstny', 'other'));

-- Comment for clarity
COMMENT ON COLUMN pool_numbers.twilio_sid IS 'Twilio number SID (PN...)';
COMMENT ON COLUMN pool_numbers.default_agent_id IS 'ElevenLabs agent ID used when no forwarding match is found';
COMMENT ON COLUMN pool_numbers.webhook_url IS 'Webhook URL configured in Twilio for this number';

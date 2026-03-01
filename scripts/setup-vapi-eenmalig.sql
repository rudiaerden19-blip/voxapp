-- Run dit EENMALIG in Supabase SQL Editor: https://supabase.com/dashboard/project/bkjqadaamxmwjeenzslr/sql
-- 1. Voeg kolom toe
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_assistant_id TEXT;
CREATE INDEX IF NOT EXISTS idx_businesses_vapi_assistant_id ON businesses(vapi_assistant_id) WHERE vapi_assistant_id IS NOT NULL;

-- 2. Koppel Vapi EU Assistant aan ALLE businesses
-- Dit is de EU assistant ID (dashboard.eu.vapi.ai)
UPDATE businesses SET vapi_assistant_id = '7a57ac55-1ca0-4395-a78b-7c78d4093d78';

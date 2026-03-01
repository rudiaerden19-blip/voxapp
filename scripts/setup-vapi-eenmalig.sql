-- Run dit EENMALIG in Supabase SQL Editor: https://supabase.com/dashboard/project/bkjqadaamxmwjeenzslr/sql
-- 1. Voeg kolom toe
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_assistant_id TEXT;
CREATE INDEX IF NOT EXISTS idx_businesses_vapi_assistant_id ON businesses(vapi_assistant_id) WHERE vapi_assistant_id IS NOT NULL;

-- 2. Koppel Vapi Assistant aan ALLE businesses
UPDATE businesses SET vapi_assistant_id = '0951136f-27b1-42cb-856c-32678ad1de57';

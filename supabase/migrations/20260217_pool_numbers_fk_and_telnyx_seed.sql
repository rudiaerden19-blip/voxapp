-- Fix: forwarding_numbers.pool_number_id should reference pool_numbers(id), not phone_numbers(id)
ALTER TABLE forwarding_numbers
  DROP CONSTRAINT IF EXISTS forwarding_numbers_pool_number_id_fkey;

ALTER TABLE forwarding_numbers
  ADD CONSTRAINT forwarding_numbers_pool_number_id_fkey
  FOREIGN KEY (pool_number_id) REFERENCES pool_numbers(id);

-- Seed: VoxApp Telnyx pool numbers (Belgian +32). Add more via Admin → Poolnummers.
INSERT INTO pool_numbers (phone_number, provider, status, country, monthly_cost, max_concurrent_calls)
VALUES
  ('+32480210449', 'telnyx', 'active', 'BE', 2.00, 10),
  ('+32480210478', 'telnyx', 'active', 'BE', 2.00, 10)
ON CONFLICT (phone_number) DO NOTHING;

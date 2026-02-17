-- Orders: kolommen voor keukenscherm en AI-bestellingen
-- POST /api/orders schrijft items, delivery_type, etc.; GET toont op /dashboard/kitchen

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'pickup',
  ADD COLUMN IF NOT EXISTS delivery_time TEXT,
  ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- Status: app gebruikt 'new', 'preparing', 'ready', 'delivered', 'archived'
-- Zorg dat 'new' bestaat (evt. al mogelijk als status VARCHAR(20))
COMMENT ON COLUMN orders.items IS 'Array of { product_id?, product_name, quantity, price, options?, notes? } voor keukenscherm';
COMMENT ON COLUMN orders.delivery_type IS 'pickup of delivery';
COMMENT ON COLUMN orders.delivery_time IS 'Afhaal-/levertijd (tekst)';

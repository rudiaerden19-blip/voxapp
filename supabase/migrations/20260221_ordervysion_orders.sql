-- OrderVysion: Uitbreiding orders tabel

-- Voeg source kolom toe (waar komt de bestelling vandaan)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'walk-in';
-- Values: 'phone' (AI telefoon), 'whatsapp', 'online', 'walk-in'

-- Voeg order_number toe (auto-increment per dag per bedrijf)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number INTEGER;

-- Comment voor duidelijkheid
COMMENT ON COLUMN orders.source IS 'Bron van bestelling: phone, whatsapp, online, walk-in';
COMMENT ON COLUMN orders.order_number IS 'Dagelijks volgnummer voor makkelijke referentie';

-- Functie om order_number automatisch te genereren
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today_start TIMESTAMP WITH TIME ZONE;
  max_number INTEGER;
BEGIN
  today_start := date_trunc('day', NOW());
  
  SELECT COALESCE(MAX(order_number), 0) INTO max_number
  FROM orders
  WHERE business_id = NEW.business_id
  AND created_at >= today_start;
  
  NEW.order_number := max_number + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger voor auto order_number
DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Index voor snelle queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

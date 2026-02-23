-- ============================================================
-- Migration: is_modifier kolom + Frituur Nolim sauzen markeren
-- ============================================================

-- Stap 1: Kolom toevoegen (idempotent)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_modifier BOOLEAN DEFAULT false;

-- Stap 2: Alle koude sauzen + warme saus-toevoegingen markeren als modifier
-- Dit zijn items die BOVENOP een basisproduct komen (friet + saus, snack + saus)
DO $$
DECLARE
  v_business_id UUID;
BEGIN
  SELECT id INTO v_business_id FROM businesses WHERE name ILIKE '%Nolim%' LIMIT 1;

  IF v_business_id IS NULL THEN
    RAISE NOTICE 'Frituur Nolim niet gevonden — sla modifier update over';
    RETURN;
  END IF;

  -- Koude sauzen = altijd modifier
  UPDATE menu_items SET is_modifier = true
  WHERE business_id = v_business_id
  AND category = 'Koude sauzen';

  -- Warme sauzen die als topping dienen (niet het stoofvlees/goulash gerecht zelf)
  UPDATE menu_items SET is_modifier = true
  WHERE business_id = v_business_id
  AND name IN ('Stoofvlees saus', 'Goulash saus');

  RAISE NOTICE 'is_modifier gezet voor Frituur Nolim sauzen (business_id: %)', v_business_id;
END $$;

-- Controleer resultaat
SELECT name, category, price, is_modifier
FROM menu_items
WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%Nolim%' LIMIT 1)
AND is_modifier = true
ORDER BY category, name;

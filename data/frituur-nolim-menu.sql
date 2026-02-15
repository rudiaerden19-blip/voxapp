-- Frituur Nolim Menu Items
-- Run dit in Supabase SQL Editor

-- Eerst: Zoek of maak de business "Frituur Nolim"
-- Als je de business_id al kent, vervang dan de variabele hieronder

DO $$
DECLARE
  v_business_id UUID;
BEGIN
  -- Zoek bestaande business of maak nieuwe
  SELECT id INTO v_business_id FROM businesses WHERE name ILIKE '%Frituur Nolim%' OR name ILIKE '%Nolim%' LIMIT 1;
  
  IF v_business_id IS NULL THEN
    -- Maak nieuwe business aan (zonder user_id - moet later gekoppeld worden)
    INSERT INTO businesses (name, type, phone, street, city, postal_code, country)
    VALUES ('Frituur Nolim', 'restaurant', '+32 11 79 01 63', 'Siberiëstraat 24A', 'Pelt', '3900', 'België')
    RETURNING id INTO v_business_id;
    
    RAISE NOTICE 'Nieuwe business aangemaakt met ID: %', v_business_id;
  ELSE
    RAISE NOTICE 'Bestaande business gevonden met ID: %', v_business_id;
  END IF;

  -- Verwijder bestaande menu items voor deze business (clean slate)
  DELETE FROM menu_items WHERE business_id = v_business_id;
  RAISE NOTICE 'Bestaande menu items verwijderd';

  -- ============================================
  -- FRIET
  -- ============================================
  INSERT INTO menu_items (business_id, category, name, price, is_available) VALUES
  (v_business_id, 'Friet', 'Kleine friet', 3.50, true),
  (v_business_id, 'Friet', 'Middelfriet', 3.80, true),
  (v_business_id, 'Friet', 'Grote friet', 4.10, true),
  (v_business_id, 'Friet', 'Friet special klein', 4.90, true),
  (v_business_id, 'Friet', 'Middelfriet special', 5.20, true),
  (v_business_id, 'Friet', 'Grote friet special', 5.50, true),
  (v_business_id, 'Friet', 'Friet stoofvlees', 8.50, true),
  (v_business_id, 'Friet', 'Friet stoofvlees saus', 5.70, true),
  (v_business_id, 'Friet', 'Friet goulash', 8.50, true),
  (v_business_id, 'Friet', 'Friet goulash saus', 5.70, true),
  (v_business_id, 'Friet', 'Friet nolim', 10.00, true),
  (v_business_id, 'Friet', 'Kinderfriet', 3.30, true);

  -- ============================================
  -- SNACKS
  -- ============================================
  INSERT INTO menu_items (business_id, category, name, price, is_available) VALUES
  (v_business_id, 'Snacks', 'Frikandel', 2.40, true),
  (v_business_id, 'Snacks', 'Frikandel special', 3.60, true),
  (v_business_id, 'Snacks', 'Cervela', 3.70, true),
  (v_business_id, 'Snacks', 'Cervela special', 5.00, true),
  (v_business_id, 'Snacks', 'Frikandel xxl', 4.30, true),
  (v_business_id, 'Snacks', 'Frikandel xxl special', 5.60, true),
  (v_business_id, 'Snacks', 'Boulet', 2.70, true),
  (v_business_id, 'Snacks', 'Boulet special', 3.90, true),
  (v_business_id, 'Snacks', 'Bamischijf', 2.90, true),
  (v_business_id, 'Snacks', 'Goulash kroket', 2.90, true),
  (v_business_id, 'Snacks', 'Vlees kroket', 2.70, true),
  (v_business_id, 'Snacks', 'Kaas kroket', 2.90, true),
  (v_business_id, 'Snacks', 'Kip fingers', 4.00, true),
  (v_business_id, 'Snacks', 'Kip nuggets', 4.20, true),
  (v_business_id, 'Snacks', 'Mexicano xxL', 3.50, true),
  (v_business_id, 'Snacks', 'Saté', 4.70, true),
  (v_business_id, 'Snacks', 'Sito stick', 4.30, true),
  (v_business_id, 'Snacks', 'Viandel', 2.70, true),
  (v_business_id, 'Snacks', 'Twijfelaar', 4.50, true),
  (v_business_id, 'Snacks', 'Crizzly', 4.50, true),
  (v_business_id, 'Snacks', 'Bitterballen 6x', 3.70, true),
  (v_business_id, 'Snacks', 'G''acky', 2.70, true),
  (v_business_id, 'Snacks', 'Picknicker', 4.30, true),
  (v_business_id, 'Snacks', 'Zigeunerstick', 3.00, true),
  (v_business_id, 'Snacks', 'Vlammetjes', 3.00, true);

  -- ============================================
  -- KOUDE SAUZEN
  -- ============================================
  INSERT INTO menu_items (business_id, category, name, price, is_available) VALUES
  (v_business_id, 'Koude sauzen', 'Mayonaise', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Zoete mayonaise', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Curry ketchup', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Tomaten ketchup', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Tartaar', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Kruiden ketchup', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Cocktail saus', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Andalouse saus', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Amerikaanse donker', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Amerikaanse licht', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Gele curry saus', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Mosterd', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Samurai saus', 1.10, true),
  (v_business_id, 'Koude sauzen', 'BBQ saus', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Mezzomix', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Joppie saus', 1.10, true),
  (v_business_id, 'Koude sauzen', 'Mammouth saus', 1.10, true);

  -- ============================================
  -- WARME SAUZEN
  -- ============================================
  INSERT INTO menu_items (business_id, category, name, price, is_available) VALUES
  (v_business_id, 'Warme sauzen', 'Stoofvlees', 6.60, true),
  (v_business_id, 'Warme sauzen', 'Stoofvlees saus', 4.00, true),
  (v_business_id, 'Warme sauzen', 'Goulasch', 6.60, true),
  (v_business_id, 'Warme sauzen', 'Goulash saus', 4.00, true);

  -- ============================================
  -- BICKY'S
  -- ============================================
  INSERT INTO menu_items (business_id, category, name, price, is_available) VALUES
  (v_business_id, 'Bicky''s', 'Bicky classic', 5.00, true),
  (v_business_id, 'Bicky''s', 'Bicky cheese', 5.50, true),
  (v_business_id, 'Bicky''s', 'Bicky hawai', 5.50, true),
  (v_business_id, 'Bicky''s', 'Bicky chicken', 5.50, true),
  (v_business_id, 'Bicky''s', 'Bicky mexicano', 5.50, true),
  (v_business_id, 'Bicky''s', 'Bicky bacon', 5.50, true),
  (v_business_id, 'Bicky''s', 'Bicky bacon cheese', 5.50, true),
  (v_business_id, 'Bicky''s', 'Bicky fish', 5.50, true);

  -- ============================================
  -- BELEGDE BROODJES
  -- ============================================
  INSERT INTO menu_items (business_id, category, name, description, price, is_available) VALUES
  (v_business_id, 'Belegde broodjes', 'Broodje kaas', 'Lang broodje, kaas, saus naar keuze, zonder groenten', 5.50, true),
  (v_business_id, 'Belegde broodjes', 'Broodje hesp', 'Lang broodje, hesp, saus naar keuze, zonder groente', 5.50, true),
  (v_business_id, 'Belegde broodjes', 'Broodje kaas smos', 'Lang broodje, kaas, groenten, saus', 6.00, true),
  (v_business_id, 'Belegde broodjes', 'Broodje hesp smos', 'Lang broodje, hesp, groenten, saus', 6.00, true),
  (v_business_id, 'Belegde broodjes', 'Broodje gezond', 'Lang broodje, kaas, hesp, saus, groenten', 6.50, true),
  (v_business_id, 'Belegde broodjes', 'Broodje preparé', 'Lang broodje, preparé, ajuinjes', 6.00, true),
  (v_business_id, 'Belegde broodjes', 'Broodje preparé smos', 'Lang broodje, preparé, groenten', 6.50, true),
  (v_business_id, 'Belegde broodjes', 'Broodje martino', 'Lang broodje, preparé, augurken, ajuintjes, martino saus', 6.50, true),
  (v_business_id, 'Belegde broodjes', 'Broodje martino smos', 'Lang broodje, preparé, augurken, ajuintjes, martino saus, groenten', 6.50, true),
  (v_business_id, 'Belegde broodjes', 'Broodje kip andalouse', 'Lang broodje, kip andalouse', 6.50, true),
  (v_business_id, 'Belegde broodjes', 'Broodje kip curry', 'Lang broodje, kip curry, groenten', 6.50, true),
  (v_business_id, 'Belegde broodjes', 'Broodje tonijn', 'Lang broodje, verse tonijn, saus, groenten', 7.00, true),
  (v_business_id, 'Belegde broodjes', 'Broodje club kip', 'Lang broodje, gepluisde kip, saus, groenten', 6.50, true),
  (v_business_id, 'Belegde broodjes', 'Club kip tropical', 'Lang broodje, gepluisde kip, ananas, saus, groenten', 7.00, true),
  (v_business_id, 'Belegde broodjes', 'Broodje eiersalade', 'Lang broodje, eiersalade, groenten', 6.50, true),
  (v_business_id, 'Belegde broodjes', 'Broodje spek & ei', 'Lang broodje, spek, ei, groenten', 6.00, true),
  (v_business_id, 'Belegde broodjes', 'Broodje spek en ei plus', 'Lang broodje, spek, ei, mexicano, saus, groenten', 9.00, true);

  -- ============================================
  -- WARME BROODJES
  -- ============================================
  INSERT INTO menu_items (business_id, category, name, description, price, is_available) VALUES
  (v_business_id, 'Warme broodjes', 'Amerikaan', 'Rond broodje, hamburger, groenten, saus', 6.00, true),
  (v_business_id, 'Warme broodjes', 'Cheese burger', 'Rond broodje, hamburger, kaas, groenten, saus', 6.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje kaaskroket', 'Rond broodje, 2x kaaskroket, groenten, saus', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje mexicano smos', 'Lang broodje, mexicano XXL, groenten, saus', 6.50, true),
  (v_business_id, 'Warme broodjes', 'Broodje kipburger', 'Rond broodje, kipburger, groenten, saus', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Hawaí burger', 'Rond broodje, hamburger, ananas, groenten, saus', 6.50, true),
  (v_business_id, 'Warme broodjes', 'Bacon burger', 'Rond broodje, hamburger, spek, groenten, saus', 6.00, true),
  (v_business_id, 'Warme broodjes', 'Bami burger', 'Lang broodje, 2x bami, groenten, saus', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje boulet', 'Lang broodje, boulet, groenten, saus', 6.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje cervela', 'Lang broodje, cervela, groenten, saus', 6.50, true),
  (v_business_id, 'Warme broodjes', 'Broodje vleeskroket', 'Lang broodje, 2x vleeskroket, groenten, saus', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje goulash kroket', 'Lang broodje, 2x goulash kroket, groenten, saus', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje mitrailette', 'Lang broodje, mexicano XXL, groenten, saus, frietjes', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje stoomboot', 'Lang broodje, 2x frikandel, groenten, saus', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje saté', 'Lang broodje, saté, groenten, saus', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje viandel', 'Lang broodje, 2x viandel, groenten, saus', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje dubbeldekker', 'Rond broodje, 2x hamburger, groenten, saus', 8.00, true),
  (v_business_id, 'Warme broodjes', 'Fish burger', 'Rond broodje, fishburger, groenten, saus', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Bacon cheese burger', 'Rond broodje, hamburger, spek, kaas, groenten, saus', 7.50, true),
  (v_business_id, 'Warme broodjes', 'Brazil burger', 'Lang broodje, mexicano XXL, kaas, spek, tomaat, ei, saus', 7.50, true),
  (v_business_id, 'Warme broodjes', 'Broodje frikandel', 'Lang broodje, 1x frikandel, groenten, saus', 6.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje ontbijt', 'Lang broodje, spek, ei, groenten, saus', 7.00, true),
  (v_business_id, 'Warme broodjes', 'Broodje ontbijt deluxe', 'Lang broodje, mexicano XXL, spek, ei, groenten, saus', 9.00, true);

  -- ============================================
  -- RUNDSBURGERS
  -- ============================================
  INSERT INTO menu_items (business_id, category, name, description, price, is_available) VALUES
  (v_business_id, 'Rundsburgers', 'Runds burger 190gr', 'Rond broodje, rundsburger 190gr, groenten, saus naar keuze', 10.00, true),
  (v_business_id, 'Rundsburgers', 'Runds cheese 190gr', 'Rond broodje, rundsburger 190gr, cheddar kaas, groenten, saus naar keuze', 10.50, true),
  (v_business_id, 'Rundsburgers', 'Runds bacon 190gr', 'Rond broodje, rundsburger 190gr, spek, groenten, saus naar keuze', 10.50, true),
  (v_business_id, 'Rundsburgers', 'Prime burger', 'Rond broodje, rundsburger 190gr, groenten, smoked bbq saus', 10.00, true),
  (v_business_id, 'Rundsburgers', 'Runds bacon cheese 190gr', 'Rond broodje, rundsburger 190gr, spek, kaas, groenten, saus naar keuze', 11.00, true),
  (v_business_id, 'Rundsburgers', 'Texas burger 2x 190gr', 'Rond broodje, 2x rundsburger 190gr, kaas, spek, groenten, saus naar keuze', 15.00, true);

  -- ============================================
  -- DRANKEN
  -- ============================================
  INSERT INTO menu_items (business_id, category, name, price, is_available) VALUES
  (v_business_id, 'Dranken', 'Cola', 2.40, true),
  (v_business_id, 'Dranken', 'Cola zero', 2.40, true),
  (v_business_id, 'Dranken', 'Fanta', 2.40, true),
  (v_business_id, 'Dranken', 'Spa bruis', 2.40, true),
  (v_business_id, 'Dranken', 'Spareine', 2.40, true),
  (v_business_id, 'Dranken', 'Caprisun', 2.00, true),
  (v_business_id, 'Dranken', 'Ice tea', 2.40, true),
  (v_business_id, 'Dranken', 'Redbull', 3.00, true),
  (v_business_id, 'Dranken', 'Sprite', 2.40, true),
  (v_business_id, 'Dranken', 'Jupiler', 2.50, true),
  (v_business_id, 'Dranken', 'Aa drink', 2.50, true),
  (v_business_id, 'Dranken', 'Monster', 4.00, true);

  RAISE NOTICE 'Alle menu items toegevoegd voor Frituur Nolim!';
  RAISE NOTICE 'Business ID: %', v_business_id;
  
END $$;

-- Controleer het resultaat
SELECT category, COUNT(*) as aantal, MIN(price) as min_prijs, MAX(price) as max_prijs 
FROM menu_items 
WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%Nolim%' LIMIT 1)
GROUP BY category
ORDER BY category;

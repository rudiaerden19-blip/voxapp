-- ============================================================
-- FRITUUR NOLIM — VOLLEDIG MENU (120+ items)
-- business_id: 0267c0ae-c997-421a-a259-e7559840897b
-- ALLEEN dit business wordt aangepast, andere tenants NIET.
-- ============================================================

BEGIN;

-- Stap 1: verwijder ALLE oude menu items voor Frituur Nolim
DELETE FROM menu_items
WHERE business_id = '0267c0ae-c997-421a-a259-e7559840897b';

-- Stap 2: insert volledig menu

-- ── FRIET ──────────────────────────────────────────────────
INSERT INTO menu_items (business_id, category, name, price, is_available, is_modifier, sort_order) VALUES
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Kinderfriet', 3.30, true, false, 1),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Kleine friet', 3.50, true, false, 2),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Middelfriet', 3.80, true, false, 3),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Grote friet', 4.10, true, false, 4),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Friet special klein', 4.90, true, false, 5),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Middelfriet special', 5.20, true, false, 6),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Grote friet special', 5.50, true, false, 7),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Friet stoofvlees', 8.50, true, false, 8),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Friet stoofvlees saus', 5.70, true, false, 9),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Friet goulash', 8.50, true, false, 10),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Friet goulash saus', 5.70, true, false, 11),
('0267c0ae-c997-421a-a259-e7559840897b', 'Friet', 'Friet nolim', 10.00, true, false, 12);

-- ── SNACKS ─────────────────────────────────────────────────
INSERT INTO menu_items (business_id, category, name, price, is_available, is_modifier, sort_order) VALUES
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Frikandel', 2.40, true, false, 20),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Frikandel special', 3.60, true, false, 21),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Cervela', 3.70, true, false, 22),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Cervela special', 5.00, true, false, 23),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Frikandel xxl', 4.30, true, false, 24),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Frikandel xxl special', 5.60, true, false, 25),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Boulet', 2.70, true, false, 26),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Boulet special', 3.90, true, false, 27),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Bamischijf', 2.90, true, false, 28),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Goulash kroket', 2.90, true, false, 29),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Vlees kroket', 2.70, true, false, 30),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Kaas kroket', 2.90, true, false, 31),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Kip fingers', 4.00, true, false, 32),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Kip nuggets', 4.20, true, false, 33),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Mexicano xxl', 3.50, true, false, 34),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Sate', 4.70, true, false, 35),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Sito stick', 4.30, true, false, 36),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Viandel', 2.70, true, false, 37),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Twijfelaar', 4.50, true, false, 38),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Crizzly', 4.50, true, false, 39),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Bitterballen 6x', 3.70, true, false, 40),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Gacky', 2.70, true, false, 41),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Picknicker', 4.30, true, false, 42),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Zigeunerstick', 3.00, true, false, 43),
('0267c0ae-c997-421a-a259-e7559840897b', 'Snacks', 'Vlammetjes', 3.00, true, false, 44);

-- ── KOUDE SAUZEN (is_modifier = true) ─────────────────────
INSERT INTO menu_items (business_id, category, name, price, is_available, is_modifier, sort_order) VALUES
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Mayonaise', 1.10, true, true, 50),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Zoete mayonaise', 1.10, true, true, 51),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Curry ketchup', 1.10, true, true, 52),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Tomaten ketchup', 1.10, true, true, 53),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Tartaar', 1.10, true, true, 54),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Kruiden ketchup', 1.10, true, true, 55),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Cocktail saus', 1.10, true, true, 56),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Andalouse saus', 1.10, true, true, 57),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Amerikaanse donker', 1.10, true, true, 58),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Amerikaanse licht', 1.10, true, true, 59),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Gele curry saus', 1.10, true, true, 60),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Mosterd', 1.10, true, true, 61),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Samurai saus', 1.10, true, true, 62),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'BBQ saus', 1.10, true, true, 63),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Mezzomix', 1.10, true, true, 64),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Joppie saus', 1.10, true, true, 65),
('0267c0ae-c997-421a-a259-e7559840897b', 'Koude sauzen', 'Mammouth saus', 1.10, true, true, 66);

-- ── WARME SAUZEN ──────────────────────────────────────────
INSERT INTO menu_items (business_id, category, name, price, is_available, is_modifier, sort_order) VALUES
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme sauzen', 'Stoofvlees', 6.60, true, false, 70),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme sauzen', 'Stoofvlees saus', 4.00, true, false, 71),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme sauzen', 'Goulasch', 6.60, true, false, 72),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme sauzen', 'Goulash saus', 4.00, true, false, 73);

-- ── BICKY'S ───────────────────────────────────────────────
INSERT INTO menu_items (business_id, category, name, price, is_available, is_modifier, sort_order) VALUES
('0267c0ae-c997-421a-a259-e7559840897b', 'Bickys', 'Bicky classic', 5.00, true, false, 80),
('0267c0ae-c997-421a-a259-e7559840897b', 'Bickys', 'Bicky cheese', 5.50, true, false, 81),
('0267c0ae-c997-421a-a259-e7559840897b', 'Bickys', 'Bicky hawai', 5.50, true, false, 82),
('0267c0ae-c997-421a-a259-e7559840897b', 'Bickys', 'Bicky chicken', 5.50, true, false, 83),
('0267c0ae-c997-421a-a259-e7559840897b', 'Bickys', 'Bicky mexicano', 5.50, true, false, 84),
('0267c0ae-c997-421a-a259-e7559840897b', 'Bickys', 'Bicky bacon', 5.50, true, false, 85),
('0267c0ae-c997-421a-a259-e7559840897b', 'Bickys', 'Bicky bacon cheese', 5.50, true, false, 86),
('0267c0ae-c997-421a-a259-e7559840897b', 'Bickys', 'Bicky fish', 5.50, true, false, 87);

-- ── BELEGDE BROODJES ──────────────────────────────────────
INSERT INTO menu_items (business_id, category, name, price, is_available, is_modifier, sort_order) VALUES
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje kaas', 5.50, true, false, 90),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje hesp', 5.50, true, false, 91),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje kaas smos', 6.00, true, false, 92),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje hesp smos', 6.00, true, false, 93),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje gezond', 6.50, true, false, 94),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje prepare', 6.00, true, false, 95),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje prepare smos', 6.50, true, false, 96),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje martino', 6.50, true, false, 97),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje martino smos', 6.50, true, false, 98),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje kip andalouse', 6.50, true, false, 99),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje kip curry', 6.50, true, false, 100),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje tonijn', 7.00, true, false, 101),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje club kip', 6.50, true, false, 102),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Club kip tropical', 7.00, true, false, 103),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje eiersalade', 6.50, true, false, 104),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje spek ei', 6.00, true, false, 105),
('0267c0ae-c997-421a-a259-e7559840897b', 'Belegde broodjes', 'Broodje spek ei deluxe', 9.00, true, false, 106);

-- ── DRANKEN ───────────────────────────────────────────────
INSERT INTO menu_items (business_id, category, name, price, is_available, is_modifier, sort_order) VALUES
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Cola', 2.40, true, false, 110),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Cola zero', 2.40, true, false, 111),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Fanta', 2.40, true, false, 112),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Spa bruis', 2.40, true, false, 113),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Spareine', 2.40, true, false, 114),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Caprisun', 2.00, true, false, 115),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Ice tea', 2.40, true, false, 116),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Redbull', 3.00, true, false, 117),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Sprite', 2.40, true, false, 118),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Jupiler', 2.50, true, false, 119),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Aa drink', 2.50, true, false, 120),
('0267c0ae-c997-421a-a259-e7559840897b', 'Dranken', 'Monster', 4.00, true, false, 121);

-- ── RUNDSBURGERS ──────────────────────────────────────────
INSERT INTO menu_items (business_id, category, name, price, is_available, is_modifier, sort_order) VALUES
('0267c0ae-c997-421a-a259-e7559840897b', 'Rundsburgers', 'Runds burger', 10.00, true, false, 130),
('0267c0ae-c997-421a-a259-e7559840897b', 'Rundsburgers', 'Runds cheese', 10.50, true, false, 131),
('0267c0ae-c997-421a-a259-e7559840897b', 'Rundsburgers', 'Runds bacon', 10.50, true, false, 132),
('0267c0ae-c997-421a-a259-e7559840897b', 'Rundsburgers', 'Prime burger', 10.00, true, false, 133),
('0267c0ae-c997-421a-a259-e7559840897b', 'Rundsburgers', 'Runds bacon cheese', 11.00, true, false, 134),
('0267c0ae-c997-421a-a259-e7559840897b', 'Rundsburgers', 'Texas burger', 15.00, true, false, 135);

-- ── WARME BROODJES ────────────────────────────────────────
INSERT INTO menu_items (business_id, category, name, price, is_available, is_modifier, sort_order) VALUES
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Amerikaan', 6.00, true, false, 140),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Cheese burger', 6.00, true, false, 141),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje kaaskroket', 7.00, true, false, 142),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje mexicano smos', 6.50, true, false, 143),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje kipburger', 7.00, true, false, 144),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Hawaii burger', 6.50, true, false, 145),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Bacon burger', 6.00, true, false, 146),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Bami burger', 7.00, true, false, 147),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje boulet', 6.00, true, false, 148),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje cervela', 6.50, true, false, 149),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje vleeskroket', 7.00, true, false, 150),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje goulash kroket', 7.00, true, false, 151),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje mitrailette', 7.00, true, false, 152),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje stoomboot', 7.00, true, false, 153),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje sate', 7.00, true, false, 154),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje viandel', 7.00, true, false, 155),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje dubbeldekker', 8.00, true, false, 156),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Fish burger', 7.00, true, false, 157),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Bacon cheese burger', 7.50, true, false, 158),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Brazil burger', 7.50, true, false, 159),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje frikandel', 6.00, true, false, 160),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje ontbijt', 7.00, true, false, 161),
('0267c0ae-c997-421a-a259-e7559840897b', 'Warme broodjes', 'Broodje ontbijt deluxe', 9.00, true, false, 162);

COMMIT;

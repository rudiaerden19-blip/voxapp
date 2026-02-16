# Supabase-tabellen overzicht

Alle tabellen die de app gebruikt en in welke migratie/schema ze staan.

| Tabel | Migratie/Schema | Gebruik |
|-------|-----------------|--------|
| **businesses** | supabase-schema.sql (+ 000: elevenlabs_agent_id, ai_phone_number) | Tenants, admin, dashboard, webhooks |
| **services** | supabase-schema.sql | Diensten per bedrijf |
| **staff** | supabase-schema.sql | Medewerkers |
| **appointments** | supabase-schema.sql | Afspraken |
| **menu_items** | supabase-schema.sql (+ 002: extra kolommen) | Producten/menu (horeca) |
| **orders** | supabase-schema.sql | Bestellingen |
| **order_items** | supabase-schema.sql | Orderregels |
| **conversations** | supabase-schema.sql | Gesprekslog (ElevenLabs/Twilio) |
| **phone_numbers** | 001_phone_numbers.sql | Twilio-nummers per business |
| **forwarding_numbers** | 20260216_forwarding_numbers.sql | Doorstuurnummers → pool |
| **pool_numbers** | 20260216_forwarding_numbers.sql | Telnyx-poolnummers |
| **call_logs** | 20260216_usage_tracking.sql | Call-log per gesprek |
| **usage_monthly** | 20260216_usage_tracking.sql | Maandelijkse verbruik |
| **option_groups** | 002_products_options.sql | Optiegroepen (sauzen, maten) |
| **option_choices** | 002_products_options.sql | Keuzes per groep |
| **product_option_links** | 002_products_options.sql | Koppel menu_item ↔ option_group |
| **profiles** | Supabase Auth / handmatig | Optioneel: by-email lookup op email→user_id |

**Volgorde migraties:** 000 → 001 → 002 → 20260216_forwarding → 20260216_usage → 20260217 (FK fix + seed).

**Let op:** Basis-tabellen (businesses, services, staff, appointments, menu_items, orders, order_items, conversations) komen uit `supabase-schema.sql`. Die moet je één keer in de SQL Editor draaien, daarna de migraties in volgorde.

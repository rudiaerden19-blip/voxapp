# Geen afspraken in agenda na call — oplossen

## Stap 1: Supabase SQL (2 minuten)

1. Ga naar: https://supabase.com/dashboard/project/bkjqadaamxmwjeenzslr/sql/new
2. Plak en run:

```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_assistant_id TEXT;
CREATE INDEX IF NOT EXISTS idx_businesses_vapi_assistant_id ON businesses(vapi_assistant_id) WHERE vapi_assistant_id IS NOT NULL;
UPDATE businesses SET vapi_assistant_id = '0951136f-27b1-42cb-856c-32678ad1de57';
```

## Stap 2: Vercel env var

1. Ga naar: https://vercel.com → je project → Settings → Environment Variables
2. Voeg toe (of controleer):
   - **Name**: `VAPI_WEBHOOK_SECRET`
   - **Value**: `ede4ecc8680196ce7bafa904bb745965b22de906cbcf7e3e4f69eface03b1ea1`
3. **Redeploy** (Deployments → ... → Redeploy)

## Stap 3: Debug check

1. Ga naar je **Agenda** in het dashboard
2. Klik op **"Bekijk debug-info"** (verschijnt als er 0 afspraken zijn)
3. Controleer:
   - `ok: true` = vapi_assistant_id is correct
   - `appointments_count` = aantal afspraken in DB
   - `appointments` = lijst

## Als het nog niet werkt

- **Vercel logs**: Project → Logs → filter op `appointments/save`
- **401**: VAPI_WEBHOOK_SECRET klopt niet of ontbreekt
- **"Invalid assistant"**: vapi_assistant_id niet gezet in DB (run Stap 1)
- **Geen logs**: Webhook wordt niet aangeroepen — controleer Vapi tool configuratie

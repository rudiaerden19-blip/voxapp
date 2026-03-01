# Vapi: afspraken in agenda na call

Als je **Vapi** gebruikt voor telefoongesprekken en de AI boekt een afspraak tijdens een call, moet die in je dashboard-agenda verschijnen.

## Stap 1: Database-migratie

Voer de migratie uit in Supabase (SQL Editor of `supabase db push`):

```sql
-- Zie supabase/migrations/20260228_vapi_assistant_id.sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_assistant_id TEXT;
CREATE INDEX IF NOT EXISTS idx_businesses_vapi_assistant_id ON businesses(vapi_assistant_id) WHERE vapi_assistant_id IS NOT NULL;
```

## Stap 2: Vapi Assistant ID koppelen

1. Ga in Vapi naar **Assistants** en kopieer het **Assistant ID** (UUID) van je receptie-assistant.
2. Ga in VoxApp naar **Dashboard → AI-instellingen**.
3. Scroll naar **Vapi Assistant ID** (bij Doorverbinden).
4. Plak het Assistant ID en klik **Opslaan & Activeren**.

## Stap 3: Vapi tool configureren

### Optie A: Via script (als de UI niet opent)

```bash
export VAPI_API_KEY="je-vapi-api-key"   # Dashboard → API Keys
export VAPI_WEBHOOK_SECRET="zelfde-als-vercel"
./scripts/vapi-boek-afspraak-tool.sh
```

Het script maakt een nieuwe tool aan met de juiste Server URL en headers. Voeg die daarna toe aan je assistant.

### Optie B: Handmatig in Vapi

In je Vapi assistant moet de tool `boek_afspraak` geconfigureerd zijn:

- **Server URL**: `https://www.voxapp.tech/api/appointments/save`
- **HTTP header**: `x-webhook-secret` met dezelfde waarde als `VAPI_WEBHOOK_SECRET` in Vercel
- **Parameters**: `naam`, `dienst`, `datum`, `tijdstip`

## Troubleshooting

- **Geen afspraak in agenda**: Controleer of `vapi_assistant_id` in AI-instellingen overeenkomt met het Assistant ID in Vapi.
- **"Invalid assistant"**: Het Assistant ID uit de call komt niet overeen met `vapi_assistant_id`, `agent_id` of `elevenlabs_agent_id` in je business-record.
- **Vercel logs**: Check `[appointments/save]` logs voor foutdetails.

# VOXAPP - VOLLEDIG STATUS RAPPORT
**Datum:** 22 februari 2026  
**Project:** VoxApp AI Receptionist  
**Repository:** https://github.com/rudiaerden19-blip/voxapp

---

## 1. PROJECT OVERZICHT

VoxApp is een AI-gestuurde telefoonreceptionist voor bedrijven. Klanten bellen, de AI neemt op, en afspraken/bestellingen worden automatisch aangemaakt.

### Technologie Stack
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI Voice:** ElevenLabs Conversational AI
- **Telefonie:** Telnyx
- **Hosting:** Vercel

---

## 2. GEBOUWDE FUNCTIONALITEITEN

### 2.1 Post-Call Webhook Systeem
**Locatie:** `/src/app/api/webhooks/elevenlabs/route.ts`

**Werking:**
1. ElevenLabs stuurt webhook na elk gesprek
2. Webhook ontvangt transcript en metadata
3. Systeem bepaalt of het horeca of afspraak-type is
4. Voor horeca: order wordt automatisch aangemaakt
5. Voor andere: afspraak wordt aangemaakt (indien bevestigd)

**Velden die geëxtraheerd worden:**
- Klantnaam (uit transcript)
- Telefoonnummer (uit transcript of caller ID)
- Afhalen/bezorgen
- Adres (bij bezorging)
- Tijd

### 2.2 Keuken Scherm
**Locatie:** `/src/app/dashboard/keuken/page.tsx`

**Features:**
- Realtime weergave van bestellingen
- Auto-refresh elke 5 seconden
- Drie kolommen: Nieuw, In bereiding, Klaar
- Geluidssignaal bij nieuwe bestelling
- Klaar-knop per bestelling

**Statussen:** pending → preparing → ready → completed

### 2.3 Module Toggle Systeem
**Locatie:** `/src/components/DashboardLayout.tsx`

**Features:**
- Sidebar toont beschikbare modules per business type
- Aan/uit sliders per module
- Optimistic UI updates (geen flikkering)
- Opslag in `enabled_modules` array in database

**API:** `/src/app/api/business/modules/route.ts`

### 2.4 Agent Voice Preservation
**Locatie:** `/src/app/api/elevenlabs/agent/route.ts`

**Fix:** Bij "Opslaan & Activeren" worden voice settings NIET meer overschreven. Alleen bij nieuwe agents worden default voice settings toegepast.

### 2.5 Producten/Menu Beheer
**Locatie:** `/src/app/dashboard/producten/page.tsx`

**Features:**
- Producten toevoegen met naam, prijs, categorie
- Prijs input accepteert komma en punt
- Geen "0" default meer in prijs veld
- Bulk import via plakken

### 2.6 Business Type Management
**Locatie:** `/src/app/api/business/update/route.ts`

**Fix:** `type` veld is nu toegevoegd aan whitelist zodat business type gewijzigd kan worden.

### 2.7 Login Verwijderd
**Locatie:** `/src/middleware.ts` en `/src/app/api/admin/auth/route.ts`

Alle login-vereisten zijn verwijderd voor development. Admin panel en dashboard zijn direct toegankelijk.

### 2.8 Test Endpoint
**URL:** `/api/test/webhook`

**Functie:** Maakt direct een test order aan in database om keuken scherm te testen.

---

## 3. DATABASE SCHEMA

### Orders Tabel
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id),
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  order_type TEXT, -- 'pickup' of 'delivery'
  pickup_time TEXT,
  delivery_time TEXT,
  status TEXT DEFAULT 'pending', -- pending, preparing, ready, completed, cancelled
  total_amount DECIMAL(10,2),
  notes TEXT,
  source TEXT, -- 'phone', 'online', 'walk-in'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Call Logs Tabel
```sql
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id),
  conversation_id TEXT,
  agent_id TEXT,
  duration_seconds INTEGER,
  duration_minutes INTEGER,
  caller_phone TEXT,
  status TEXT,
  transcript JSONB,
  summary TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Businesses Tabel Vereiste Kolommen
```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS agent_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS enabled_modules TEXT[];
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS voice_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS max_appointments_per_day INTEGER DEFAULT 8;
```

---

## 4. ELEVENLABS CONFIGURATIE

### Webhook Configuratie (HANDMATIG)
1. Ga naar ElevenLabs Dashboard
2. Navigate naar: ElevenAgents → Settings
3. Zoek "Post-Call Webhook"
4. Klik "Select Webhook" of "Create"
5. Vul in:
   - **URL:** `https://voxapp.io/api/webhooks/elevenlabs`
   - **Events:** Transcript
   - **Auth:** HMAC

### Webhook Secret
```
wsec_c3ccdc7fbd8f39a8fca6cc27257d2e61f33f8756808e366076e60e4392dcb8a6
```

### Voice Instellen
1. Ga naar ElevenLabs → je agent
2. Selecteer gewenste stem (bijv. Roos - Dutch Professional)
3. Sla op in ElevenLabs
4. VoxApp zal deze NIET overschrijven bij updates

---

## 5. NOG TE DOEN

### 5.1 Kritiek (Moet voor productie)
- [ ] Webhook testen na deploy (ga naar `/api/test/webhook`)
- [ ] Frituur Nolim business type wijzigen naar "Frituur"
- [ ] Menu/producten invullen met prijzen
- [ ] Vlaamse stem selecteren in ElevenLabs
- [ ] Echte test-bestelling plaatsen via telefoon

### 5.2 Nice to Have
- [ ] Order items parsing uit transcript (nu alleen notes)
- [ ] Prijsberekening automatisch
- [ ] SMS bevestiging naar klant
- [ ] WhatsApp integratie
- [ ] Bezorgtijden/slots

### 5.3 Bekend Issues
- Webhook payload format van ElevenLabs kan variëren - handler accepteert nu meerdere formats
- Voice in ElevenLabs UI kan afwijken van wat in database staat

---

## 6. BELANGRIJKE BESTANDEN

| Bestand | Functie |
|---------|---------|
| `src/app/api/webhooks/elevenlabs/route.ts` | Webhook ontvanger van ElevenLabs |
| `src/app/api/elevenlabs/agent/route.ts` | Agent create/update naar ElevenLabs |
| `src/app/dashboard/keuken/page.tsx` | Keuken scherm UI |
| `src/app/dashboard/producten/page.tsx` | Menu/producten beheer |
| `src/lib/modules.ts` | Module definities per business type |
| `src/components/DashboardLayout.tsx` | Sidebar met module toggles |
| `src/app/api/business/update/route.ts` | Business gegevens updaten |
| `src/app/api/business/modules/route.ts` | Module toggles API |
| `src/app/api/test/webhook/route.ts` | Test endpoint voor debugging |

---

## 7. GIT COMMITS (Laatste 10)

```
439588d - Fix: Robuuste webhook handler + preserve voice settings + test endpoint
2e97250 - Add extensive webhook logging  
0746fee - Fix price input: remove 0 default, allow comma/decimal input
3f15bf9 - Remove ALL login requirements
b71c860 - Fix: Add 'type' to allowed update fields
085405f - Add post-call webhook config + improved AI instructions
32c554b - Post-call webhook analyse voor automatische afspraken/bestellingen
```

---

## 8. ENVIRONMENT VARIABLES

Vereist in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_WEBHOOK_SECRET=wsec_c3ccdc7fbd8f39a8fca6cc27257d2e61f33f8756808e366076e60e4392dcb8a6
NEXT_PUBLIC_APP_URL=https://voxapp.io
```

---

## 9. TEST INSTRUCTIES

### Test 1: Database Order Test
1. Ga naar: `https://voxapp.io/api/test/webhook`
2. Zou JSON response moeten geven met `success: true`
3. Ga naar Dashboard → Keuken
4. Test order moet zichtbaar zijn

### Test 2: Echte Bestelling
1. Zorg dat business type = "Frituur"
2. Zorg dat menu producten zijn ingevuld
3. Activeer AI receptie (Opslaan & Activeren)
4. Bel het Telnyx nummer
5. Plaats bestelling: "2 friet, 1 frikandel, afhalen, naam Jan, nummer 0478123456"
6. Bevestig en hang op
7. Wacht 60 seconden
8. Check Keuken scherm

---

## 10. CONTACT & SUPPORT

**Repository:** https://github.com/rudiaerden19-blip/voxapp
**Hosting:** Vercel
**Database:** Supabase

---

*Dit document bevat de volledige status van het VoxApp project per 22 februari 2026.*

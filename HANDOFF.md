# VoxApp - Handoff Document voor Nieuwe Agent

## Project Overzicht

**VoxApp** is een AI-powered receptionist SaaS platform voor Belgische KMO's. De applicatie biedt:
- AI telefonische receptionist (via ElevenLabs Conversational AI)
- Automatische afsprakenplanning
- SMS bevestigingen
- Multi-tenant architectuur (elk bedrijf heeft eigen admin)

## Tech Stack

- **Frontend**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 + inline React styles
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Authentication
- **AI Voice**: ElevenLabs Conversational AI
- **Hosting**: Vercel
- **Repo**: https://github.com/rudiaerden19-blip/voxapp

---

## Huidige Status

### PROBLEEM: Vercel Build Faalt

De build faalt met: `Missing Supabase environment variables`

De environment variables zijn correct ingesteld in `.env.local` maar worden niet correct geladen op Vercel.

**Tijdelijke fix** (in `next.config.ts`): Fallback waarden toegevoegd. Dit is GEEN goede oplossing.

**De juiste oplossing** is:
1. Ga naar Vercel → voxapp project → Settings → Environment Variables
2. Voeg toe (voor ALLE environments: Production, Preview, Development):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://bkjqadaamxmwjeenzslr.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (zie .env.local)
3. Redeploy MET "Use existing Build Cache" UITGEVINKT

---

## Credentials & API Keys

### Supabase
```
URL: https://bkjqadaamxmwjeenzslr.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJranFhZGFhbXhtd2plZW52c2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDE4ODYsImV4cCI6MjA4NjQxNzg4Nn0.S150ziiXSs_TH9TsktOTmWuidi9gNwho6naAjZkUjyY
```

### ElevenLabs
```
API Key: sk_b735b4420708337f056d0433712442606799bc96b6a41103
Agent ID: agent_7001kh7ck6cvfpqvrt1gc63bs88k
```

---

## Database Schema (Supabase)

Het schema is al uitgevoerd in Supabase. Belangrijke tabellen:

| Tabel | Beschrijving |
|-------|-------------|
| `businesses` | Bedrijven/tenants met user_id, name, type, phone, opening_hours, agent_id |
| `services` | Diensten per bedrijf (name, duration, price) |
| `staff` | Medewerkers per bedrijf |
| `appointments` | Afspraken met customer_name, start_time, status, sms_sent flags |
| `menu_items` | Menu items voor horeca |
| `orders` | Bestellingen voor horeca |
| `order_items` | Items per bestelling |
| `conversations` | Gesprekslog van AI receptionist |

**Row Level Security (RLS)** is actief - users kunnen alleen eigen business data zien.

Volledig schema: zie `supabase-schema.sql`

---

## Project Structuur

```
/Users/rudiaerden/voxapp/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page met demo's en live AI test
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Global styles
│   │   ├── login/page.tsx    # Login pagina
│   │   ├── register/page.tsx # Registratie (2-staps)
│   │   └── dashboard/page.tsx # Dashboard voor ingelogde users
│   └── lib/
│       └── supabase.ts       # Supabase client singleton
├── public/
│   ├── audio/                # Demo audio files (b1.mp3, g_r1.mp3, etc.)
│   ├── hero-receptionist.png
│   ├── garage.png
│   └── restaurant.png
├── next.config.ts            # Next.js config (bevat tijdelijke fallback env vars)
├── .env.local                # Lokale env vars (NIET committen)
└── supabase-schema.sql       # Database schema
```

---

## Pagina's

### 1. Landing Page (`/`)
- Hero section met CTA's
- Demo modals met audio gesprekken (Kapsalon Belle, Garage Willems, Restaurant De Molen)
- **TryLiveSection**: Klanten kunnen LIVE bellen met de AI receptionist via ElevenLabs
- Features, How it Works, Pricing, FAQ secties

### 2. Login (`/login`)
- Email + wachtwoord
- Supabase auth

### 3. Register (`/register`)
- 2-staps registratie:
  - Stap 1: Bedrijfsnaam, type, telefoon
  - Stap 2: Email, wachtwoord
- Maakt auth user + business record in Supabase

### 4. Dashboard (`/dashboard`)
- Sidebar met navigatie
- Overzicht stats (afspraken, gesprekken)
- Lijst van afspraken vandaag
- **Nog te bouwen**: Medewerkers, Services, AI Receptionist instellingen, Agenda

---

## ElevenLabs Agent Configuratie

De agent (ID: `agent_7001kh7ck6cvfpqvrt1gc63bs88k`) is geconfigureerd met:

```json
{
  "turn_timeout": 3.0,
  "turn_eagerness": "eager",
  "optimize_streaming_latency": 4,
  "speed": 1.1,
  "llm": "gpt-4o-mini",
  "temperature": 0.2
}
```

System prompt bevat instructies voor:
- Kapsalon Belle receptionist
- Nederlands/Vlaams spreken
- Namen onthouden, niet 2x vragen
- Beknopt en efficiënt

---

## Nog Te Bouwen (Roadmap)

### Fase 1: Dashboard Functionaliteit
- [ ] Services CRUD pagina
- [ ] Medewerkers CRUD pagina
- [ ] Afspraken beheer met kalender view
- [ ] AI Receptionist configuratie (voice, prompt)

### Fase 2: Agenda Integratie
- [ ] Real-time beschikbaarheid check
- [ ] Afspraken boeken via AI
- [ ] SMS bevestigingen (Twilio/MessageBird)
- [ ] Herinneringen automatisch versturen

### Fase 3: Horeca Module
- [ ] Menu beheer
- [ ] Bestelling via telefoon
- [ ] Real-time order display
- [ ] SMS notificaties

### Fase 4: Voice Clone
- [ ] Voice cloning wizard
- [ ] Custom agent per tenant

---

## Belangrijke Code Fragmenten

### Supabase Client (`src/lib/supabase.ts`)
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}
```

### ElevenLabs Live Call (`TryLiveSection` in page.tsx)
```typescript
const conversation = useConversation({
  onConnect: () => setCallStatus('connected'),
  onDisconnect: () => setCallStatus('idle'),
  onError: (error) => { /* handle */ },
  onModeChange: ({ mode }) => setIsSpeaking(mode === 'speaking'),
});

// Start call
await conversation.startSession({
  agentId: 'agent_7001kh7ck6cvfpqvrt1gc63bs88k',
  connectionType: 'webrtc',
});
```

---

## Commands

```bash
# Development
cd /Users/rudiaerden/voxapp
npm run dev

# Build
npm run build

# Deploy (auto via GitHub push)
git add -A && git commit -m "message" && git push
```

---

## Stijl Notities

- **Kleuren**: 
  - Primary: `#f97316` (oranje)
  - Background dark: `#0a0a0f`, `#16161f`
  - Text: white, `#9ca3af` (grijs)
- **Border radius**: 8px (buttons), 16px (cards), 20px (grote containers)
- **Font**: System fonts via Tailwind

---

## Contact

**Gebruiker**: Rudi Aerden
- Wil kalme, doordachte ontwikkeling
- Spreekt Nederlands/Vlaams
- Focus op kwaliteit, niet snelheid

---

## Laatste Probleem

**Status**: Build faalt op Vercel vanwege environment variables.

**Actie nodig**: 
1. Verifieer dat `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` correct in Vercel staan
2. Redeploy zonder cache
3. Als dat niet werkt, verwijder de fallback in `next.config.ts` en debug waarom env vars niet laden

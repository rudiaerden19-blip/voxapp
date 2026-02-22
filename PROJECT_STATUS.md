# PROJECT STATUS — VOXAPP ENTERPRISE PLATFORM
# ⚠ ELKE AGENT MOET DIT EERST LEZEN ⚠
# Laatste update: 2026-02-23 01:30

=====================================================================
WAT IS DIT?
=====================================================================

Dit document is de SINGLE SOURCE OF TRUTH voor de voortgang.
Elke nieuwe agent leest dit EERST, zodat niemand opnieuw moet uitleggen
waar we staan.

Lees ook: ENTERPRISE_PROJECT_CONSTITUTION.md (bindende regels)

=====================================================================
ARCHITECTUUR (ACTIEF)
=====================================================================

```
Klant belt → Twilio → ElevenLabs STT
    → Custom LLM endpoint (Vercel serverless)
    → Deterministische State Machine (VoiceOrderSystem)
    → Supabase (tenant-scoped sessies + orders)
    → ElevenLabs TTS (via phonetische rewrite layer)
```

Geen GPT vrije conversatie. Code beslist, niet AI.

=====================================================================
WAT IS AF ✅
=====================================================================

## Voice Engine — State Machine
- [x] `src/lib/voice-engine/VoiceOrderSystem.ts`
- [x] States: TAKING_ORDER → DELIVERY_TYPE → GET_NAME → GET_ADDRESS → GET_PHONE → CONFIRM → DONE
- [x] Deterministische flow, geen GPT interpretatie
- [x] STT normalizer (HARDCODED_REPLACEMENTS) — fixt spraakherkenningsfouten
- [x] TTS phonetische rewrite (TTS_REPLACEMENTS) — fixt uitspraak ElevenLabs
- [x] Fuzzy matching + Levenshtein voor menu-items
- [x] Multi-item parsing: splitst op punt, komma, "en" + hoeveelheid
- [x] Saus-afkortingen: "samurai" → "samurai saus", "tomatenketchup" → "tom ketchup"
- [x] Prijsberekening: som van base product + sauzen per item
- [x] SAUCE_ITEMS set om base product vs saus te onderscheiden

## Custom LLM Endpoint
- [x] `src/app/api/voice-engine/v1/chat/completions/route.ts`
- [x] OpenAI Chat Completions API compatible (SSE streaming)
- [x] ElevenLabs Custom LLM mode
- [x] Sessie opslag in Supabase `voice_sessions` tabel
- [x] Alleen LAATSTE user message verwerken per beurt
- [x] Order insert in Supabase bij DONE state

## Multi-Tenant
- [x] BusinessConfig interface (name, ai_name, welcome_message, prep_times, delivery_enabled)
- [x] resolveBusiness via agent_id (ElevenLabs stuurt dit mee)
- [x] Fallback: eerste business met menu-items
- [x] Dynamische begroeting uit DB (welcome_message)
- [x] Dynamische bereidingstijd uit DB (prep_time_pickup/delivery)
- [x] delivery_enabled toggle — slaat DELIVERY_TYPE stap over als false
- [x] Menu laden per business_id
- [x] Orders per business_id
- [x] Sessies per business_id

## Kitchen Screen
- [x] `src/app/dashboard/kitchen/page.tsx`
- [x] Receipt-stijl bonnen met items, prijzen, totaal
- [x] Auto-refresh elke 5 seconden
- [x] Status knoppen: NIEUW → IN BEREIDING → KLAAR → AFGEHAALD
- [x] Parser accepteert "1x item" formaat

## Marketing Website
- [x] `src/app/page.tsx` — AFGESLOTEN, niet wijzigen tenzij expliciet gevraagd
- [x] Professioneel design, mobile-first
- [x] Pricing, FAQ, testimonials, CTA, footer

## Database (Supabase)
- [x] `businesses` — tenant data + agent_id + welcome_message + voice_id
- [x] `menu_items` — producten per business met naam, prijs, is_available
- [x] `orders` — bestellingen per business
- [x] `voice_sessions` — actieve gesprekssessies per conversation_id
- [x] `calls` — gesprekslog
- [x] `services`, `staff`, `appointments` — basis tabellen

## Enterprise Infrastructure (2026-02-23)
- [x] `src/lib/tenant.ts` — TenantContext type + requireTenant() runtime guard
- [x] `src/lib/logger.ts` — Structured JSON logging (CallLog per gesprek)
- [x] `src/app/api/metrics/route.ts` — GET /api/metrics?tenant_id=... endpoint
- [x] `src/__tests__/tenant-isolation.test.ts` — 18 tests, allemaal groen
- [x] Tenant guard in voice engine (beide endpoints): request zonder tenant → hard fail
- [x] Structured logging in voice engine: conversation_id, tenant_id, duration, state transitions
- [x] Tenant guard in orders API (GET, POST, PATCH, DELETE) — allemaal tenant-scoped

## Tenant Provisioning (2026-02-23)
- [x] `src/lib/tenant-templates.ts` — Menu templates per type: frituur, restaurant, kapper, garage, dokter
- [x] `POST /api/tenants/provision` — Zero-touch onboarding:
  - Maakt business record in Supabase
  - Laadt menu uit template (34 items voor frituur, 13 voor restaurant, etc.)
  - Maakt ElevenLabs agent aan met Custom LLM URL
  - Genereert welcome message uit template + business naam
  - Zet trial van 14 dagen
  - Retourneert tenant_id, agent_id, status

## Governance
- [x] ENTERPRISE_PROJECT_CONSTITUTION.md — bindende regels
- [x] START_HERE.md — verplichte lezing
- [x] .cursorrules — automatisch geladen door elke agent, verwijst naar PROJECT_STATUS.md
- [x] PROJECT_STATUS.md — dit document (single source of truth)

=====================================================================
WAT NOG MOET ❌
=====================================================================

## P0 — Moet af voor Bol.com demo (deadline: ~maart 2026)
- [ ] 5/5 echte beltesten met correcte bon
- [ ] ElevenLabs agent volledig op Custom LLM mode zetten (UI stappen)
- [ ] Supabase kolommen toevoegen: ai_name, prep_time_pickup, prep_time_delivery, delivery_enabled

## P1 — Enterprise features

- [ ] Tenant guard toevoegen aan overige ~20 routes (admin, ai-tools, knowledge, etc.)
- [ ] Call logging: start_time, end_time, duration, state_transitions, error_count
- [ ] Dashboard: gesprekkenlijst met transcripties
- [ ] Dashboard: realtime statistieken (oproepen vandaag, omzet, gemiddelde orderbedrag)
- [ ] Onboarding wizard voor nieuwe tenants
- [ ] Twilio nummer provisioning per tenant
- [ ] ElevenLabs agent aanmaken per tenant (API)
- [ ] SMS bevestigingen via Twilio

## P2 — Later

- [ ] Voice cloning per tenant
- [ ] Multi-language (NL/FR/DE)
- [ ] Kassa-koppeling Vysion Horeca
- [ ] Stripe betalingen + abonnementenbeheer

=====================================================================
BEKENDE BUGS / AANDACHTSPUNTEN
=====================================================================

- ElevenLabs uitspraak: sommige Vlaamse woorden klinken niet perfect
  → Workaround: TTS_REPLACEMENTS fonetische herschrijving
- ElevenLabs agent moet nog handmatig op Custom LLM mode gezet worden in UI
- Supabase kolommen ai_name/prep_time_pickup/prep_time_delivery/delivery_enabled
  bestaan mogelijk nog niet → code heeft fallback defaults

=====================================================================
KEY FILES
=====================================================================

```
src/lib/voice-engine/VoiceOrderSystem.ts    — State machine + parser + TTS rewrite
src/app/api/voice-engine/v1/chat/completions/route.ts — Custom LLM endpoint (SSE)
src/app/api/voice-engine/route.ts           — Legacy endpoint (JSON)
src/app/api/metrics/route.ts                — Metrics endpoint (per tenant)
src/app/api/tenants/provision/route.ts      — Zero-touch tenant provisioning
src/lib/tenant-templates.ts                 — Menu templates per business type
src/app/dashboard/kitchen/page.tsx          — Kitchen screen
src/app/page.tsx                            — Marketing website (NIET WIJZIGEN)
src/lib/tenant.ts                           — TenantContext + runtime guard
src/lib/logger.ts                           — Structured JSON logging
src/__tests__/tenant-isolation.test.ts      — 18 enterprise tests
jest.config.ts                              — Test configuratie
ENTERPRISE_PROJECT_CONSTITUTION.md          — Bindende regels
PROJECT_STATUS.md                           — Dit document
.cursorrules                                — Agent instructies
```

=====================================================================
SUPABASE
=====================================================================

URL: https://bkjqadaamxmwjeenzslr.supabase.co
Tenant: frituur nolim — business_id: 0267c0ae-c997-421a-a259-e7559840897b
Agent ID: agent_6301khhy4aa2ftcrpw9wx7shj1wf

=====================================================================
REGELS VOOR AGENTS
=====================================================================

1. Lees EERST dit document + ENTERPRISE_PROJECT_CONSTITUTION.md
2. Geen code wijzigen zonder te begrijpen waar we staan
3. Na elke wijziging: dit document updaten
4. Commit + push na elke taak
5. Geen feature creep — werk alleen aan wat gevraagd wordt
6. Test altijd via productie URL: https://www.voxapp.tech

=====================================================================
EINDE STATUS
=====================================================================

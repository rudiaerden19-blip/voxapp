# ENTERPRISE PROJECT CONSTITUTION
# MULTI-TENANT CLOUD VOICE PLATFORM
# VERSION 1.0 – BINDEND

=====================================================================
PROJECT MISSIE
=====================================================================

Dit is een enterprise-grade multi-tenant voice automation platform.

Dit is GEEN hobby-app.
Dit is GEEN experiment.
Dit is GEEN prompt-playground.

Doel:
Een stabiel, schaalbaar en voorspelbaar cloud-native voice platform
dat menselijke telefonieprocessen kan vervangen.

Target:
- 500+ tenants
- Enterprise demo-waardig
- Deterministische core
- Geen improvisatie-AI

=====================================================================
TECH STACK (CLOUD ONLY)
=====================================================================

Source of truth:
- GitHub

Runtime:
- Vercel (serverless)

Database:
- Supabase (tenant-scoped)

Voice:
- ElevenLabs (STT + TTS)

Telephony:
- Twilio

Verboden:
- Lokale-only productie-oplossingen
- In-memory globale sessies
- Lokale database als waarheid

=====================================================================
ARCHITECTUUR
=====================================================================

Klant belt
    ↓
Twilio
    ↓
ElevenLabs STT
    ↓
Custom LLM endpoint (/api/voice-engine op Vercel)
    ↓
Deterministische State Machine
    ↓
Supabase (tenant-scoped)
    ↓
ElevenLabs TTS (via rewrite layer)

Geen GPT vrije conversatie.
Geen autonome LLM-beslissingen.

=====================================================================
MULTI-TENANT REGELS (NIET ONDERHANDELBAAR)
=====================================================================

- Elke request MOET tenant_id bevatten.
- Elke sessie is tenant-scoped.
- Elke database query is tenant-scoped.
- Elke tabel bevat tenant_id NOT NULL.
- Composite primary key: (tenant_id + id).
- Metrics per tenant.
- Orders per tenant.

Request zonder tenant_id → HARD FAIL.

=====================================================================
TECHNISCHE ENFORCEMENT
=====================================================================

TypeScript verplicht:

type TenantContext = {
  tenant_id: string;
};

Elke handler vereist:

function handleVoiceRequest(
  tenant: TenantContext,
  transcript: string
)

Runtime guard verplicht:

if (!tenant_id) {
  throw new Error("TENANT_ID_REQUIRED");
}

Unit tests verplicht:
- Tenant A ziet nooit data van Tenant B.
- Request zonder tenant_id faalt.
- Metrics zijn tenant-scoped.

Build moet falen als tenant-isolation test faalt.

=====================================================================
STATE MACHINE
=====================================================================

States:
- TAKING_ORDER
- DELIVERY_TYPE
- GET_NAME
- GET_ADDRESS
- GET_PHONE
- CONFIRM
- DONE

Verboden:
- Dynamische flow
- GPT-interpretatie
- Autonome AI-logica

Parser beslist.
Code beslist.
Niet AI.

=====================================================================
TTS REGELS
=====================================================================

- Rewrite layer verplicht.
- Geen ruwe tekst naar ElevenLabs.
- Moeilijke woorden fonetisch herschrijven.
- Neutrale, stabiele toon.

=====================================================================
LOGGING & METRICS
=====================================================================

Per call loggen:
- conversation_id
- tenant_id
- start_time
- end_time
- duration
- state_transitions
- error_count
- completion_status

Metrics endpoint verplicht:
GET /api/metrics

=====================================================================
DEFINITION OF DONE
=====================================================================

Een build is alleen acceptabel als:

- 5/5 testcalls correcte JSON order geven
- Geen tenant leakage
- Geen parser fouten
- Geen dubbele items
- Logging werkt
- Metrics werkt
- Geen globale state
- Deploy via Vercel succesvol

=====================================================================
VERBODEN
=====================================================================

- Geen architectuurwijzigingen zonder document update
- Geen feature creep
- Geen globale variabelen
- Geen impliciete aannames
- Geen wijzigingen zonder tests

=====================================================================
EINDE CONSTITUTION
=====================================================================

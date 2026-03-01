#!/usr/bin/env python3
"""Generate VoxApp Project Document PDF."""

from fpdf import FPDF
import textwrap

def clean(text):
    """Replace unicode chars not supported by latin-1 core fonts."""
    return (text
        .replace("\u2014", "-")   # em dash
        .replace("\u2013", "-")   # en dash
        .replace("\u2018", "'")   # left single quote
        .replace("\u2019", "'")   # right single quote
        .replace("\u201c", '"')   # left double quote
        .replace("\u201d", '"')   # right double quote
        .replace("\u2026", "...") # ellipsis
        .replace("\u2022", "*")   # bullet
        .replace("\u2192", "->")  # arrow
        .replace("\u2190", "<-")  # arrow
        .replace("\u2193", "v")   # down arrow
        .replace("\u2191", "^")   # up arrow
        .replace("\u2265", ">=")  # >=
        .replace("\u2264", "<=")  # <=
        .replace("\u20ac", "E")   # euro sign
        .replace("\u00e9", "e")   # e accent
    )

class VoxPDF(FPDF):
    def _put_text(self, text, *a, **kw):
        return super()._put_text(clean(text), *a, **kw)

    def cell(self, w=0, h=0, text="", *a, **kw):
        return super().cell(w, h, clean(str(text)), *a, **kw)

    def header(self):
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(150, 150, 150)
        super().cell(0, 5, "VOXAPP - VERTROUWELIJK", align="R")
        self.ln(8)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        super().cell(0, 10, f"Pagina {self.page_no()}/{{nb}}", align="C")

    def section_header(self, text):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(26, 26, 46)
        self.ln(6)
        self.cell(0, 10, clean(text))
        self.ln(10)
        self.set_draw_color(26, 26, 46)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def sub_header(self, text):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(50, 50, 80)
        self.ln(3)
        self.cell(0, 8, clean(text))
        self.ln(8)

    def body_text(self, text):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(30, 30, 30)
        for line in clean(text).split("\n"):
            stripped = line.strip()
            if not stripped:
                self.ln(3)
                continue
            wrapped = textwrap.wrap(stripped, width=95)
            for w in wrapped:
                self.cell(0, 5, w)
                self.ln(5)

    def bullet(self, text):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(30, 30, 30)
        wrapped = textwrap.wrap(clean(text), width=90)
        for i, w in enumerate(wrapped):
            prefix = "  -  " if i == 0 else "     "
            self.cell(0, 5, prefix + w)
            self.ln(5)

    def code_block(self, text):
        self.set_font("Courier", "", 8)
        self.set_text_color(40, 40, 40)
        self.set_fill_color(245, 245, 245)
        for line in clean(text).split("\n"):
            if len(line) > 100:
                line = line[:97] + "..."
            self.cell(0, 4.5, "  " + line, fill=True)
            self.ln(4.5)
        self.ln(2)

    def table_row(self, cols, widths, bold=False):
        self.set_font("Helvetica", "B" if bold else "", 8)
        self.set_text_color(30, 30, 30)
        if bold:
            self.set_fill_color(230, 230, 240)
        for i, col in enumerate(cols):
            w = widths[i]
            txt = clean(str(col))
            if len(txt) > int(w / 2.5):
                txt = txt[:int(w / 2.5) - 2] + ".."
            self.cell(w, 6, txt, border=1, fill=bold)
        self.ln(6)

    def check_page_break(self, h=30):
        if self.get_y() + h > 270:
            self.add_page()


pdf = VoxPDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=20)
pdf.add_page()

# ── TITLE PAGE ──
pdf.ln(50)
pdf.set_font("Helvetica", "B", 28)
pdf.set_text_color(26, 26, 46)
pdf.cell(0, 15, "VOXAPP", align="C")
pdf.ln(18)
pdf.set_font("Helvetica", "", 16)
pdf.set_text_color(80, 80, 100)
pdf.cell(0, 10, "AI Receptionist Platform", align="C")
pdf.ln(12)
pdf.cell(0, 10, "Volledig Projectdocument", align="C")
pdf.ln(20)
pdf.set_font("Helvetica", "", 11)
pdf.set_text_color(120, 120, 120)
pdf.cell(0, 8, clean("Versie 2.0 — Eigen Orchestratie Architectuur"), align="C")
pdf.ln(8)
pdf.cell(0, 8, "Datum: 28 februari 2026", align="C")
pdf.ln(8)
pdf.cell(0, 8, "Status: VERTROUWELIJK", align="C")
pdf.ln(30)
pdf.set_draw_color(26, 26, 46)
pdf.line(60, pdf.get_y(), 150, pdf.get_y())
pdf.ln(10)
pdf.set_font("Helvetica", "I", 9)
pdf.cell(0, 6, "www.voxapp.tech", align="C")

# ── PAGE 2: INHOUDSOPGAVE ──
pdf.add_page()
pdf.section_header("INHOUDSOPGAVE")
toc = [
    "1.  Wat is VoxApp?",
    "2.  Tech Stack",
    "3.  EU-Only Regels",
    "4.  Architectuur — Eigen Orchestratie + Vapi Audio",
    "5.  Bestaande Code (39 API routes, 13 lib bestanden)",
    "6.  Database Schema (15+ tabellen)",
    "7.  Wat Gebouwd Moet Worden (4 fases)",
    "8.  Vapi Custom LLM Configuratie",
    "9.  Multi-Tenant Regels",
    "10. Beveiliging",
    "11. Conversatie Kwaliteitsregels",
    "12. Git & Deploy Regels",
    "13. Pricing Model",
    "14. Key Files Referentie",
]
for item in toc:
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 7, item)
    pdf.ln(7)

# ── 1. WAT IS VOXAPP ──
pdf.add_page()
pdf.section_header("1. WAT IS VOXAPP?")
pdf.body_text(
    "VoxApp is een AI-receptionist platform voor KMO's in Belgie, Nederland en Duitsland. "
    "De AI neemt de telefoon op voor bedrijven (kappers, restaurants, dokters, garages, advocaten, etc.), "
    "boekt afspraken, beantwoordt vragen, en stuurt bevestigingen. 24/7. Met de eigen stem van de eigenaar."
)
pdf.ln(4)
pdf.sub_header("Kerngegevens")
pdf.bullet("Website: www.voxapp.tech")
pdf.bullet("GitHub: github.com/rudiaerden19-blip/voxapp.git")
pdf.bullet("Doelgroep: Kappers, tandartsen, dokters, garages, restaurants, advocaten")
pdf.bullet("Regio: Benelux + DACH")
pdf.bullet("Talen: Nederlands (Vlaams), Frans, Duits")

# ── 2. TECH STACK ──
pdf.add_page()
pdf.section_header("2. TECH STACK")

pdf.sub_header("Frontend")
pdf.bullet("Next.js (App Router, TypeScript)")
pdf.bullet("Tailwind CSS v4 — gebruik @import 'tailwindcss', NIET oude @tailwind")
pdf.bullet("Lucide React icons")
pdf.bullet("Mobile-first design — altijd EERST telefoon, daarna desktop")

pdf.sub_header("Backend / Runtime")
pdf.bullet("Vercel (serverless, Edge Runtime)")
pdf.bullet("Supabase (PostgreSQL) — EU regio")
pdf.bullet("Database URL: https://bkjqadaamxmwjeenzslr.supabase.co")

pdf.sub_header("Voice AI")
pdf.bullet("Orchestratie: Vapi EU (api.eu.vapi.ai — Frankfurt) als audio-laag")
pdf.bullet("STT: Deepgram (via Vapi) — nova-2 model")
pdf.bullet("LLM: OpenAI GPT-4o-mini (EIGEN aanroep, niet via Vapi)")
pdf.bullet("TTS: ElevenLabs (via Vapi) — eleven_flash_v2_5")

pdf.sub_header("Telephonie")
pdf.bullet("Provider: Telnyx")
pdf.bullet("Belgisch nummer: +32480210478")
pdf.bullet("Anchorsite: Amsterdam, Netherlands (NOOIT San Jose)")

pdf.sub_header("Deployment")
pdf.bullet("Hosting: Vercel — automatisch via GitHub push")
pdf.bullet("CI/CD: GitHub -> Vercel (nooit lokaal)")
pdf.bullet("Cron: vercel.json — /api/health elke 5 minuten")

# ── 3. EU-ONLY REGELS ──
pdf.add_page()
pdf.section_header("3. EU-ONLY REGELS (NIET ONDERHANDELBAAR)")
pdf.body_text("Alle data en processing MOET binnen de EU blijven. Dit is niet optioneel.")
pdf.ln(3)
pdf.bullet("Vapi API: ALTIJD api.eu.vapi.ai (Frankfurt), NOOIT api.vapi.ai (US)")
pdf.bullet("Telnyx anchorsite: Amsterdam, Netherlands — NOOIT San Jose, CA")
pdf.bullet("Supabase: EU regio")
pdf.bullet("Vercel: automatische regio (EU edge functions)")
pdf.bullet("Geen data naar US servers")
pdf.bullet("GDPR compliant: opt-in recordings, retention policy")

pdf.sub_header("Vapi EU Environment Variables")
w = [55, 125]
pdf.table_row(["Variable", "Waarde"], w, bold=True)
pdf.table_row(["VAPI_API_BASE", "https://api.eu.vapi.ai"], w)
pdf.table_row(["VAPI_ASSISTANT_ID", "7a57ac55-1ca0-4395-a78b-7c78d4093d78"], w)
pdf.table_row(["VAPI_PHONE_NUMBER_ID", "ad5fb1f0-1db8-4a64-a56b-2f4254101481"], w)
pdf.table_row(["VAPI_CREDENTIAL_ID", "5b86a7bb-5d64-4518-ae15-f261e7ea7c19"], w)

# ── 4. ARCHITECTUUR ──
pdf.add_page()
pdf.section_header("4. ARCHITECTUUR — EIGEN ORCHESTRATIE + VAPI AUDIO")

pdf.body_text(
    "Vapi wordt ALLEEN gebruikt als audio-infrastructuur (STT + TTS + telephony). "
    "De conversatie-logica, state machine, LLM aanroepen en booking logic "
    "draaien op ONZE backend via een Custom LLM endpoint."
)
pdf.ln(4)

pdf.sub_header("Call Flow")
pdf.code_block(
    "Klant belt +32480210478\n"
    "    |\n"
    "Telnyx (anchorsite: Amsterdam)\n"
    "    |\n"
    "Vapi EU (Frankfurt) — ontvangt audio\n"
    "    |\n"
    "Deepgram STT — audio -> tekst\n"
    "    |\n"
    "Vapi stuurt transcript naar ONZE Custom LLM URL\n"
    "POST https://www.voxapp.tech/api/vapi/chat\n"
    "    |\n"
    "ONZE BACKEND:\n"
    "  |- Parse transcript\n"
    "  |- Haal session state op (Supabase voice_sessions)\n"
    "  |- State Machine bepaalt volgende stap\n"
    "  |- OpenAI GPT-4o-mini genereert antwoord\n"
    "  |- Check availability inline (Supabase)\n"
    "  |- Slot locking + booking\n"
    "  |- Return antwoordtekst naar Vapi\n"
    "    |\n"
    "Vapi stuurt tekst naar ElevenLabs TTS\n"
    "    |\n"
    "Audio terug naar beller"
)

pdf.sub_header("Voordelen Eigen Orchestratie")
pdf.bullet("Deterministische state machine (code beslist, niet AI)")
pdf.bullet("Eigen LLM controle (model, temperature, prompt per state)")
pdf.bullet("Inline availability check (VOOR je iets voorstelt aan klant)")
pdf.bullet("Slot locking (soft lock voordat klant bevestigt)")
pdf.bullet("Geen tool call overhead (alles in een request)")
pdf.bullet("Latency winst: minder hops")
pdf.bullet("Migreerbaar: later Vapi vervangen door eigen audio pipeline")

# ── 5. BESTAANDE CODE ──
pdf.add_page()
pdf.section_header("5. BESTAANDE CODE")

pdf.sub_header("API Routes (39 endpoints)")

routes = [
    ("Afspraken", [
        ("/api/appointments/save", "Vapi tool — afspraak opslaan", "WERKEND"),
    ]),
    ("Beschikbaarheid", [
        ("/api/availability", "GET slots, POST check tijdstip", "WERKEND"),
    ]),
    ("Health & Failover", [
        ("/api/health", "Health check (cron 5min)", "WERKEND"),
        ("/api/telnyx/failover", "Telnyx failover bij Vapi down", "WERKEND"),
    ]),
    ("Admin", [
        ("/api/admin/auth", "Admin login", "WERKEND"),
        ("/api/admin/tenants", "Tenant CRUD", "WERKEND"),
        ("/api/admin/services", "Diensten CRUD", "WERKEND"),
        ("/api/admin/staff", "Medewerkers CRUD", "WERKEND"),
        ("/api/admin/appointments", "Afspraken CRUD", "WERKEND"),
        ("/api/admin/kennisbank", "Kennisbank CRUD", "WERKEND"),
        ("/api/admin/pool-numbers", "Pool nummers", "WERKEND"),
    ]),
    ("Business", [
        ("/api/business/[id]", "Business data", "WERKEND"),
        ("/api/business/by-email", "Zoek op email", "WERKEND"),
        ("/api/business/update", "Business updaten", "WERKEND"),
        ("/api/business/modules", "Module config", "WERKEND"),
    ]),
    ("AI Tools", [
        ("/api/ai-tools/check-availability", "AI: beschikbaarheid", "WERKEND"),
        ("/api/ai-tools/create-appointment", "AI: afspraak", "WERKEND"),
        ("/api/ai-tools/create-order", "AI: bestelling", "WERKEND"),
    ]),
    ("ElevenLabs", [
        ("/api/elevenlabs/agent", "Agent beheer", "WERKEND"),
        ("/api/elevenlabs/voices", "Stemmen ophalen", "WERKEND"),
        ("/api/elevenlabs/preview", "Stem preview", "WERKEND"),
        ("/api/webhooks/elevenlabs", "ElevenLabs webhook", "WERKEND"),
    ]),
    ("Stripe", [
        ("/api/stripe/checkout", "Checkout sessie", "BASIS"),
        ("/api/stripe/portal", "Klantportaal", "BASIS"),
        ("/api/stripe/webhook", "Stripe webhook", "BASIS"),
    ]),
    ("Overig", [
        ("/api/tenants/provision", "Tenant onboarding", "WERKEND"),
        ("/api/metrics", "Metrics per tenant", "WERKEND"),
        ("/api/knowledge", "Kennisbank API", "WERKEND"),
        ("/api/usage", "Verbruik tracking", "WERKEND"),
        ("/api/forwarding", "Doorverbinden", "WERKEND"),
    ]),
]

w3 = [55, 75, 50]
for category, items in routes:
    pdf.check_page_break(20 + len(items) * 7)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(50, 50, 80)
    pdf.cell(0, 6, category)
    pdf.ln(7)
    pdf.table_row(["Route", "Functie", "Status"], w3, bold=True)
    for route, func, status in items:
        pdf.table_row([route, func, status], w3)
    pdf.ln(4)

# ── Lib bestanden ──
pdf.add_page()
pdf.sub_header("Library Bestanden (src/lib/)")
libs = [
    ("apiAuth.ts", "Webhook + admin + ElevenLabs auth"),
    ("apiLogger.ts", "Structured JSON API logging"),
    ("logger.ts", "Call logging (voice engine)"),
    ("tenant.ts", "TenantContext + requireTenant() guard"),
    ("supabase.ts", "Database client + types"),
    ("adminAuth.ts", "Admin authenticatie"),
    ("planFacts.ts", "Support AI feiten + FAQ"),
    ("stripe.ts", "Stripe integratie"),
    ("tenant-templates.ts", "Menu templates per type"),
    ("translations.ts", "Website vertalingen (NIET WIJZIGEN)"),
    ("modules.ts", "Module definities"),
    ("BusinessContext.tsx", "React business context"),
    ("LanguageContext.tsx", "React taal context"),
]
wl = [55, 125]
pdf.table_row(["Bestand", "Functie"], wl, bold=True)
for name, func in libs:
    pdf.table_row([name, func], wl)

# ── 6. DATABASE ──
pdf.add_page()
pdf.section_header("6. DATABASE SCHEMA (SUPABASE)")

tables = [
    ("businesses", "Hoofd tenant tabel", "id, name, type, phone, email, address, opening_hours, vapi_assistant_id, elevenlabs_agent_id, subscription_*"),
    ("services", "Diensten per tenant", "id, business_id, name, duration_minutes, price, is_active"),
    ("staff", "Medewerkers per tenant", "id, business_id, name, working_hours (JSONB), is_active"),
    ("appointments", "Afspraken per tenant", "id, business_id, service_id, staff_id, customer_name, start_time, end_time, status"),
    ("conversations", "Gesprekslog", "id, business_id, caller_phone, transcript, summary, duration_seconds"),
    ("menu_items", "Menu items (horeca)", "id, business_id, name, price, category, is_available"),
    ("orders", "Bestellingen", "id, business_id, customer_name, total_amount, status"),
    ("order_items", "Bestelregels", "id, order_id, menu_item_id, quantity, unit_price"),
    ("voice_sessions", "Gesprekssessies", "conversation_id, tenant_id, state, collected_data"),
    ("knowledge_base", "Kennisbank", "id, business_id, category, title, content"),
    ("phone_numbers", "Nummers per tenant", "telefoonnummer configuratie"),
    ("pool_numbers", "Pool nummers", "gedeelde nummers"),
    ("call_logs", "Call tracking", "gesprek metadata"),
    ("usage_monthly", "Maandverbruik", "minuten per tenant per maand"),
    ("forwarding_numbers", "Doorverbindnrs", "doorverbind configuratie"),
]

wt = [35, 35, 110]
pdf.table_row(["Tabel", "Scope", "Kolommen"], wt, bold=True)
for name, scope, cols in tables:
    pdf.check_page_break(8)
    pdf.table_row([name, scope, cols], wt)

# ── 7. WAT GEBOUWD MOET WORDEN ──
pdf.add_page()
pdf.section_header("7. WAT GEBOUWD MOET WORDEN")

pdf.sub_header("FASE 1: Custom LLM Endpoint (week 1-2)")
pdf.body_text("Bouw een OpenAI-compatibel endpoint waar Vapi elk transcript naartoe stuurt. Onze backend beslist wat de AI zegt.")
pdf.ln(2)

fase1_files = [
    ("src/app/api/vapi/chat/route.ts", "Custom LLM endpoint — Vapi stuurt transcripts, wij beslissen"),
    ("src/lib/appointment-engine/StateMachine.ts", "Deterministische state machine (GREETING -> COLLECT -> CONFIRM -> BOOK)"),
    ("src/lib/appointment-engine/NLU.ts", "Natural Language Understanding — extract intent + entiteiten"),
    ("src/lib/appointment-engine/SessionStore.ts", "Session state opslag per call (Supabase voice_sessions)"),
    ("src/lib/appointment-engine/AvailabilityChecker.ts", "Inline beschikbaarheid check (openingsuren, staff, conflicten)"),
    ("src/lib/appointment-engine/SlotLocker.ts", "Soft lock mechanisme (lock -> confirm -> commit)"),
    ("src/lib/appointment-engine/ResponseGenerator.ts", "Natuurlijk antwoord generatie per state"),
    ("src/lib/appointment-engine/SMSConfirmation.ts", "SMS bevestiging na boeking via Twilio"),
]
wf = [80, 100]
pdf.table_row(["Bestand", "Functie"], wf, bold=True)
for path, func in fase1_files:
    pdf.check_page_break(8)
    pdf.table_row([path, func], wf)

pdf.ln(4)
pdf.sub_header("State Machine States")
pdf.code_block(
    "GREETING           -> Begroeting, vraag wat klant wil\n"
    "COLLECT_SERVICE     -> Welke behandeling?\n"
    "COLLECT_DATE        -> Welke dag?\n"
    "COLLECT_TIME        -> Welk uur?\n"
    "COLLECT_NAME        -> Naam van de klant?\n"
    "CHECK_AVAILABILITY  -> Inline check in Supabase\n"
    "CONFIRM             -> Bevestiging vragen aan klant\n"
    "BOOK                -> Afspraak opslaan + SMS\n"
    "SUCCESS             -> Bevestiging uitspreken\n"
    "RESCHEDULE          -> Verplaatsen flow\n"
    "CANCEL              -> Annuleren flow\n"
    "ESCALATE            -> Doorverbinden naar mens\n"
    "ERROR               -> Foutafhandeling"
)

pdf.check_page_break(60)
pdf.sub_header("FASE 2: Business Logic & Validatie (week 3-4)")
fase2 = [
    "Openingsuren check — businesses.opening_hours JSONB",
    "Medewerker beschikbaarheid — staff.working_hours + bestaande appointments",
    "Diensten dynamisch laden — services tabel per tenant",
    "Annuleer afspraak flow — zoek op naam+datum, bevestig, cancel",
    "Verplaats afspraak flow — cancel oud + book nieuw",
    "Nearest alternatives bij conflict — 2 dichtstbijzijnde vrije slots",
]
for item in fase2:
    pdf.bullet(item)

pdf.check_page_break(50)
pdf.sub_header("FASE 3: SMS & Monitoring (week 5-6)")
fase3 = [
    "SMS bevestiging na boeking (Twilio)",
    "SMS annulering (klant antwoordt ANNULEER)",
    "Booking metrics per tenant per dag",
    "Slack alerts bij failures (accuracy < 98%, escalatie > 3%)",
    "Prompt finetuning per state (50+ test calls)",
]
for item in fase3:
    pdf.bullet(item)

pdf.check_page_break(50)
pdf.sub_header("FASE 4: Multi-Tenant Productie (week 7-8)")
fase4 = [
    "Automatische prompt generatie per tenant uit DB",
    "Vapi EU assistant aanmaken per tenant via API",
    "Telnyx nummer provisioning per tenant",
    "Onboarding wizard in dashboard (7 stappen)",
    "Stripe betalingen + abonnementenbeheer",
]
for item in fase4:
    pdf.bullet(item)

# ── 8. VAPI CUSTOM LLM CONFIG ──
pdf.add_page()
pdf.section_header("8. VAPI CUSTOM LLM CONFIGURATIE")

pdf.body_text("De Vapi EU assistant moet geconfigureerd worden om ONZE Custom LLM URL te gebruiken:")
pdf.ln(3)

pdf.sub_header("Via Vapi Dashboard")
pdf.bullet("Login op dashboard.vapi.ai")
pdf.bullet("Ga naar assistant 7a57ac55-1ca0-4395-a78b-7c78d4093d78")
pdf.bullet("Onder 'Model': kies 'Custom LLM'")
pdf.bullet("URL: https://www.voxapp.tech/api/vapi/chat")
pdf.bullet("Opslaan")

pdf.sub_header("Via API")
pdf.code_block(
    "PATCH https://api.eu.vapi.ai/assistant/7a57ac55-...\n"
    "Authorization: Bearer <VAPI_API_KEY>\n"
    "{\n"
    '  "model": {\n'
    '    "provider": "custom-llm",\n'
    '    "url": "https://www.voxapp.tech/api/vapi/chat",\n'
    '    "model": "voxapp-orchestrator"\n'
    "  }\n"
    "}"
)

pdf.sub_header("Vapi Instellingen")
settings = [
    ("silenceTimeoutSeconds", "20"),
    ("responseDelaySeconds", "0.4"),
    ("backchannelingEnabled", "false"),
    ("backgroundSound", "off"),
    ("firstMessage", "Hallo, waarmee kan ik u helpen?"),
    ("voice.provider", "11labs"),
    ("voice.model", "eleven_flash_v2_5"),
]
ws = [60, 120]
pdf.table_row(["Instelling", "Waarde"], ws, bold=True)
for k, v in settings:
    pdf.table_row([k, v], ws)

# ── 9. MULTI-TENANT ──
pdf.add_page()
pdf.section_header("9. MULTI-TENANT REGELS")
mt_rules = [
    "Elke request MOET tenant_id / business_id bevatten",
    "Request zonder tenant -> HARD FAIL (throw TenantError)",
    "Elke database query filtert op business_id",
    "Geen DEFAULT_TENANT_ID fallback in productie",
    "Geen cross-tenant data leakage",
    "Alle metrics per tenant",
    "Alle logs bevatten tenant_id",
    "voice_sessions zijn per call_id + business_id",
]
for rule in mt_rules:
    pdf.bullet(rule)

# ── 10. BEVEILIGING ──
pdf.section_header("10. BEVEILIGING")
pdf.sub_header("Endpoint Authenticatie")
sec = [
    ("Webhook endpoints", "x-webhook-secret header", "verifyWebhookSecret()"),
    ("Admin endpoints", "Admin cookie of x-api-key", "verifyAdminApiKey()"),
    ("ElevenLabs", "x-webhook-secret header", "verifyElevenLabsSecret()"),
]
wsec = [45, 65, 70]
pdf.table_row(["Type", "Methode", "Functie"], wsec, bold=True)
for t, m, f in sec:
    pdf.table_row([t, m, f], wsec)

pdf.ln(4)
pdf.sub_header("Beveiligingsregels")
sec_rules = [
    "Geen hardcoded credentials in code",
    "Alle secrets in .env.local (lokaal) en Vercel env vars (productie)",
    ".env.local NOOIT committen naar git",
    "Geen PII in logs (namen, telefoonnummers redacten)",
    "Rate limiting op publieke endpoints",
]
for rule in sec_rules:
    pdf.bullet(rule)

# ── 11. CONVERSATIE KWALITEIT ──
pdf.add_page()
pdf.section_header("11. CONVERSATIE KWALITEITSREGELS")

pdf.sub_header("Toon")
pdf.body_text("Warm, rustig, Vlaams-Nederlands. Niet formeel. Niet overdreven.")
pdf.ln(3)

pdf.sub_header("Regels")
conv_rules = [
    "Maximaal 2 zinnen per antwoord",
    "Een vraag tegelijk",
    "Herhaal altijd kritieke info (datum, tijd, naam)",
    "Nooit Engels spreken",
    "Geen commerciele taal",
    "Geen uitroeptekens",
    "Geen robotzinnen",
]
for rule in conv_rules:
    pdf.bullet(rule)

pdf.sub_header("Verboden Zinnen")
blacklist = [
    "Dit duurt maar een seconde",
    "Geen probleem",
    "Absoluut",
    "Zeker weten",
    "Super / Geweldig / Perfect",
]
for z in blacklist:
    pdf.bullet(z)

pdf.sub_header("Filler bij Latency > 800ms")
fillers = ["Momentje...", "Even kijken...", "Ik controleer dat even."]
for f in fillers:
    pdf.bullet(f)

pdf.sub_header("Dag+Uur Combo Herkenning")
pdf.body_text(
    "Als de klant dag EN uur tegelijk zegt (bijv. 'dinsdag om 10 uur'), "
    "herken beide en sla de aparte tijdvraag over."
)

# ── 12. GIT & DEPLOY ──
pdf.add_page()
pdf.section_header("12. GIT & DEPLOY REGELS")
git_rules = [
    "Na ELKE taak: git add . && git commit && git push origin main",
    "Commit messages in het Nederlands",
    "Gebruik required_permissions: ['all'] voor git push",
    "Deploy gaat automatisch via Vercel na push",
    "NOOIT lokaal bouwen of testen",
    "NOOIT force push naar main",
    "NOOIT git config wijzigen",
    "NOOIT --no-verify gebruiken",
    "Test altijd via productie URL: https://www.voxapp.tech",
]
for rule in git_rules:
    pdf.bullet(rule)

pdf.sub_header("Vercel Environment Variables (vereist)")
env_vars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ELEVENLABS_API_KEY",
    "ELEVENLABS_WEBHOOK_SECRET",
    "TELNYX_API_KEY",
    "VAPI_API_KEY",
    "VAPI_API_BASE=https://api.eu.vapi.ai",
    "VAPI_ASSISTANT_ID",
    "VAPI_WEBHOOK_SECRET",
    "OPENAI_API_KEY (NIEUW — voor eigen LLM calls)",
    "TWILIO_ACCOUNT_SID (voor SMS)",
    "TWILIO_AUTH_TOKEN (voor SMS)",
    "TWILIO_PHONE_NUMBER (voor SMS)",
]
for v in env_vars:
    pdf.bullet(v)

# ── 13. PRICING ──
pdf.add_page()
pdf.section_header("13. PRICING MODEL")

wp = [40, 35, 30, 35, 40]
pdf.table_row(["Plan", "Prijs", "Minuten", "Extra/min", "Marge"], wp, bold=True)
pdf.table_row(["Starter", "E99/mnd", "300", "E0,40", "~75%"], wp)
pdf.table_row(["Pro", "E149/mnd", "750", "E0,35", "~80%"], wp)
pdf.table_row(["Business", "E249/mnd", "1500", "E0,30", "~83%"], wp)
pdf.ln(4)
pdf.body_text("Kostprijs per klant: ~E25/maand")

# ── 14. KEY FILES ──
pdf.section_header("14. KEY FILES REFERENTIE")
key_files = [
    ("PROJECT_STATUS.md", "SINGLE SOURCE OF TRUTH — altijd updaten"),
    ("ENTERPRISE_PROJECT_CONSTITUTION.md", "Bindende enterprise regels"),
    (".cursorrules", "Agent instructies"),
    ("src/lib/apiAuth.ts", "Alle auth functies"),
    ("src/lib/apiLogger.ts", "Structured logging"),
    ("src/lib/logger.ts", "Call logging"),
    ("src/lib/tenant.ts", "Tenant enforcement"),
    ("src/lib/supabase.ts", "Database client + types"),
    ("src/app/api/appointments/save/route.ts", "Huidig booking endpoint"),
    ("src/app/api/health/route.ts", "Health check (cron)"),
    ("src/app/api/telnyx/failover/route.ts", "Failover"),
    ("vercel.json", "Cron configuratie"),
]
wk = [80, 100]
pdf.table_row(["Bestand", "Functie"], wk, bold=True)
for path, func in key_files:
    pdf.check_page_break(8)
    pdf.table_row([path, func], wk)

# ── LAST PAGE ──
pdf.add_page()
pdf.ln(40)
pdf.set_font("Helvetica", "B", 16)
pdf.set_text_color(26, 26, 46)
pdf.cell(0, 12, "SAMENVATTING", align="C")
pdf.ln(20)
pdf.set_font("Helvetica", "", 10)
pdf.set_text_color(50, 50, 50)

summary_points = [
    "VoxApp is een AI-receptionist platform voor Belgische KMO's.",
    "39 API routes en 15+ database tabellen staan klaar.",
    "Vapi EU wordt gebruikt als audio-laag (STT + TTS).",
    "De conversatie-logica wordt EIGEN gebouwd (Custom LLM endpoint).",
    "Deterministische state machine — code beslist, niet AI.",
    "ALLES via EU endpoints — geen US routing.",
    "Multi-tenant architectuur met harde tenant isolation.",
    "4 bouwfases: Custom LLM -> Validatie -> SMS -> Onboarding.",
    "Na elke taak: git commit + push naar GitHub -> Vercel deploy.",
    "Marketingwebsite is AFGESLOTEN — niet wijzigen.",
]

for point in summary_points:
    pdf.bullet(point)

pdf.ln(20)
pdf.set_draw_color(26, 26, 46)
pdf.line(60, pdf.get_y(), 150, pdf.get_y())
pdf.ln(10)
pdf.set_font("Helvetica", "I", 9)
pdf.set_text_color(120, 120, 120)
pdf.cell(0, 6, clean("VoxApp — www.voxapp.tech — Vertrouwelijk Document"), align="C")

# ── OUTPUT ──
pdf.output("/Users/rudiaerden/voxapp/docs/VOXAPP_PROJECTDOCUMENT.pdf")
print("PDF generated: docs/VOXAPP_PROJECTDOCUMENT.pdf")

# Vercel – Environment Variables

Zet deze in **Vercel** → Project → **Settings** → **Environment Variables**. Kies **Production** (en eventueel Preview) en voeg toe.

---

## Verplicht (zonder deze faalt de app)

| Variable | Beschrijving | Waar te vinden |
|----------|--------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (geheim) | Supabase → Project Settings → API |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | ElevenLabs → Profile → API Key |

---

## Telnyx (voor poolnummers + inkomende gesprekken)

| Variable | Beschrijving | Waar te vinden |
|----------|--------------|----------------|
| `TELNYX_API_KEY` | Telnyx API key | Telnyx Portal → API Keys |
| `ELEVENLABS_SIP_DOMAIN` | Optioneel; standaard `sip.rtc.elevenlabs.io` | ElevenLabs SIP-instellingen |

---

## Admin panel

| Variable | Beschrijving | Standaard (niet aan te raden in productie) |
|----------|--------------|--------------------------------------------|
| `ADMIN_EMAIL` | Admin inlog-e-mail | `admin@voxapp.tech` |
| `ADMIN_PASSWORD` | Admin wachtwoord | Zet een sterk wachtwoord |
| `ADMIN_SESSION_SECRET` | Geheim voor sessie-cookie | Zet een lange random string |

---

## Stripe (als je abonnementen/facturatie gebruikt)

| Variable | Beschrijving |
|----------|--------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (whsec_...) |
| `STRIPE_PRICE_ID` | Optioneel; price ID voor abonnement |
| `NEXT_PUBLIC_APP_URL` | Je app-URL, bijv. `https://voxapp.tech` (voor Stripe return URLs) |

---

## Optioneel

| Variable | Beschrijving |
|----------|--------------|
| `ELEVENLABS_WEBHOOK_SECRET` | Voor verificatie van ElevenLabs webhooks |
| `TWILIO_ACCOUNT_SID` | Alleen als je Twilio-nummers in de app koopt |
| `TWILIO_AUTH_TOKEN` | Alleen als je Twilio gebruikt |
| `GEMINI_API_KEY` | Alleen als je menu-parsing (parse-menu) gebruikt |

---

**Na toevoegen:** bij wijziging van env vars kan Vercel vragen om een **redeploy**; doe dat zodat de nieuwe waarden actief zijn.

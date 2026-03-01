# Fix: Call gaat niet meer door — gesprek mislukt

## Probleem

Het Belgische nummer **+32480210478** stond niet meer in Vapi. Oproepen kwamen daardoor niet door.

**"Geen aansluiting"** = gesprek komt helemaal niet tot stand (geen ring, bezet, of stil). Dan is de keten Telnyx → Vapi kapot.

---

## Checklist: geen aansluiting

Controleer in deze volgorde:

### 1. Telnyx Portal — nummer actief?

1. Ga naar [Telnyx Portal](https://portal.telnyx.com) → **Numbers** → zoek +32480210478
2. Controleer: nummer **actief**, niet opgeschort, geen betalingsprobleem
3. Controleer: nummer gekoppeld aan een **Voice Application** (niet "unassigned")

### 2. Telnyx Voice Application — webhook naar Vapi

1. Ga naar **Call Control** → **Voice** → **Applications**
2. Open de Application die aan +32480210478 gekoppeld is
3. **Webhook URL** moet wijzen naar Vapi (niet naar voxapp.tech):
   - US: `https://api.vapi.ai/telnyx/inbound_call`
   - EU: `https://api.eu.vapi.ai/telnyx/inbound_call`
4. Als hier `https://www.voxapp.tech/api/telnyx/webhook` staat → dat is de oude flow (ElevenLabs). Voor Vapi moet het naar Vapi wijzen.

### 3. Vapi — nummer aanwezig en gekoppeld

1. Ga naar [Vapi Dashboard](https://dashboard.vapi.ai) → **Phone Numbers**
2. Zoek +32480210478
3. Als het nummer **ontbreekt** → gebruik onderstaande oplossing
4. Als het nummer **wel** staat: controleer of het aan assistant **VoxApp Kapper** (of jouw assistant) is gekoppeld

### 4. Vapi Credential — Telnyx-koppeling

1. In Vapi: **Organization** → **Credentials** (of waar je Telnyx-credential beheert)
2. Het credential dat bij het nummer hoort (credentialId) moet geldig zijn
3. Als je een nieuw credential hebt aangemaakt: koppel het nummer opnieuw aan dat credential

---

## Oplossing (automatisch)

### Via API — alles in één keer

```
POST https://www.voxapp.tech/api/fix-vapi-phone
```

**Geen body nodig.** Het endpoint:
1. Zet de Telnyx webhook naar Vapi (als die nu naar voxapp wijst)
2. Voegt het nummer toe in Vapi als het ontbreekt

Vereist in Vercel: `TELNYX_API_KEY` + `VAPI_API_KEY`.

### Via script (lokaal)

```bash
node scripts/add-vapi-belgian-number.mjs
```

Vereist `VAPI_API_KEY` in `.env.local`.

### Handmatig via Vapi Dashboard

1. Ga naar **[Vapi Dashboard](https://dashboard.vapi.ai)** → **Phone Numbers**
2. Klik **Create Phone Number** → tab **Telnyx**
3. Voer nummer **+32480210478** in
4. Koppel aan assistant **VoxApp Kapper**
5. Sla op

## Extra: appointments/save (als gesprek wel doorkomt maar afspraak faalt)

De endpoint retourneert nu correct `{ results: [{ toolCallId, result }] }` voor Vapi.
Geen 127.0.0.1 debug-fetches meer (die faalden op Vercel).

## Verificatie

Na het toevoegen:

1. Bel **+32480210478**
2. Je hoort: "Hallo, met kapsalon Anja. Wil je een afspraak maken?"
3. Het gesprek verloopt normaal

---

## EU-regio

Als je Vapi in de EU-regio gebruikt, controleer in het Vapi-dashboard of je organisatie op **EU** staat. Dan moet de Telnyx webhook naar `https://api.eu.vapi.ai/telnyx/inbound_call` wijzen (niet api.vapi.ai).

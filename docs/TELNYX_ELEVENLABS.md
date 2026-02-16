# Telnyx + ElevenLabs koppeling

VoxApp gebruikt **Telnyx** voor Belgische poolnummers en **ElevenLabs** voor de AI-stem. Zo koppel je ze.

## 1. Omgeving

Zet in `.env.local` (en op Vercel):

- `TELNYX_API_KEY` – API Key uit [Telnyx Portal](https://portal.telnyx.com) → API Keys
- `ELEVENLABS_SIP_DOMAIN` – optioneel; standaard `sip.rtc.elevenlabs.io`

## 2. Telnyx: Webhook op je Connection

1. Ga in Telnyx naar **Connections** (of **Call Control** → Connection).
2. Kies de Connection die je poolnummers gebruikt.
3. Bij **Webhook URL** vul in:  
   `https://<jouw-domein>/api/telnyx/webhook`
4. Sla op.

Bij een inkomende call op een poolnummer roept Telnyx deze URL aan; de app zoekt de klant (via Diversion) en verbindt het gesprek door naar ElevenLabs.

## 3. ElevenLabs: SIP-trunk voor inkomend

1. Log in op [ElevenLabs](https://elevenlabs.io) → Conversational AI → **Phone Numbers** of **SIP**.
2. Maak een **SIP Inbound Trunk** aan (of gebruik bestaande).
3. Noteer het **SIP-adres** (bijv. `sip.rtc.elevenlabs.io`) en eventueel de gebruikersnaam/agent-mapping.
4. Koppel de trunk aan de juiste **Agent** (per klant/agent_id).

De webhook verbindt door naar:  
`sip:<agent_id>@sip.rtc.elevenlabs.io`  
(zonder port tenzij je die expliciet configureert). Als ElevenLabs een andere URI- of agent-mapping gebruikt, pas dan in de code of via env de SIP-URI aan.

## 4. Doorsturen (Diversion)

Op een poolnummer komen alleen **doorgestuurde** gesprekken: de klant stuurt zijn eigen nummer door naar het poolnummer. De provider moet het **oorspronkelijke nummer** meesturen (SIP-header **Diversion**). Zonder Diversion kan de app niet bepalen welke klant gebeld wordt.

- Bij klanten: instructies geven om bij hun provider “bij geen antwoord / altijd doorsturen” in te stellen naar het toegewezen poolnummer.
- De provider moet bij doorsturen de Diversion-header zetten (vaak standaard bij doorsturen).

## 5. Samenvatting

| Stap | Waar | Wat |
|------|------|-----|
| 1 | .env | `TELNYX_API_KEY`, optioneel `ELEVENLABS_SIP_DOMAIN` |
| 2 | Telnyx | Webhook URL = `https://<domein>/api/telnyx/webhook` |
| 3 | ElevenLabs | SIP Inbound Trunk aanmaken en koppelen aan agent(s) |
| 4 | Klant | Eigen nummer doorsturen naar poolnummer (Diversion vereist) |

Daarna worden inkomende gesprekken op het poolnummer beantwoord en doorgestuurd naar de juiste ElevenLabs-agent.

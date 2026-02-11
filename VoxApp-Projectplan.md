# VoxApp — AI Receptionist Platform
### Projectplan & Technische Documentatie

---

## Wat is VoxApp?

VoxApp is een AI-receptionist platform voor KMO's in België, Nederland en Duitsland.

De AI neemt de telefoon op voor bedrijven (kappers, restaurants, dokters, garages, advocaten, etc.), boekt afspraken in een **ingebouwde agenda**, beantwoordt vragen, en stuurt bevestigingen. 24/7. Met de eigen stem van de eigenaar.

**Website:** www.voxapp.tech  
**GitHub:** https://github.com/rudiaerden19-blip/voxapp.git

---

## Referentie

Wij bouwen hetzelfde concept als **Intavia** (www.intavia.ai) — een AI receptionist die telefonisch oproepen beantwoordt, afspraken boekt en administratie automatiseert.

**Maar wij doen het beter:**

| | Intavia (www.intavia.ai) | VoxApp (www.voxapp.tech) |
|--|--------------------------|--------------------------|
| Talen | Alleen Engels | Nederlands, Frans, Duits |
| Markt | UK | België, Nederland, Duitsland |
| Setup | 30-60 dagen met hun team | 10 minuten self-service |
| Agenda | Geen eigen agenda, koppeling met externe tools | **Eigen ingebouwde agenda** |
| Voice cloning | Nee | Ja — klant kloont eigen stem |
| Focus | Enterprise / klinieken | KMO's — iedereen |
| Prijs | £199+ (€230+) | Vanaf €99/maand |
| Kassa koppeling | Nee | Ja — directe link met Vysion Horeca kassasysteem |

**Het grote verschil: wij hebben een eigen agenda ingebouwd.** De klant heeft geen Google Calendar of Outlook nodig. Alles zit in 1 platform: AI receptionist + agenda + dashboard. Twee vliegen in één klap.

---

## Doelgroep

Elke KMO die een telefoon heeft en afspraken maakt:

| Sector | Probleem |
|--------|---------|
| Kappers & Beauty | Handen vol verf, kan niet opnemen |
| Restaurants & Horeca | Keuken draait, telefoon rinkelt |
| Dokters & Tandartsen | Volle wachtzaal, secretaresse overbelast |
| Garages & Herstellers | Onder een auto, mist 50% van oproepen |
| Advocaten & Boekhouders | Druk met dossiers, telefoon gaat constant |
| Loodgieters & Elektriciens | Op de baan, kan nooit opnemen |
| Immobiliën | Lead belt, niemand neemt op |
| Dierenartsen | Zelfde als dokters |

**Markt in cijfers:**
- België: 1.186.000 KMO's
- Nederland: 1.600.000 MKB's
- Duitsland: 3.870.000 KMU's
- **Totaal: 6.656.000 potentiële klanten**

---

## Wat bouwen we?

### 1. Marketing Website (www.voxapp.tech)

Professionele landing page in de stijl van www.intavia.ai:

- **Hero sectie** — donkere achtergrond, headline links, foto rechts met UI overlays
- **Feature secties** — witte achtergrond, tekst links, foto rechts, met tabs/slider
  - Inkomende oproepen (beantwoorden, afspraken boeken, vragen beantwoorden)
  - Uitgaande oproepen (herinneringen, follow-ups, herboekingen)
  - Geautomatiseerde taken (boekingslinks, wijzigingen, lead capture)
- **Reviews sectie** — donkere achtergrond, horizontale slider met 5 klantreviews
- **Pricing sectie** — 3 plannen met features
- **Footer** — links, juridisch, contact

Design: professioneel, mobile-first, geen felle kleuren.

### 2. Klant Dashboard

Na inloggen ziet de klant:

- **Overzicht** — aantal oproepen vandaag, afspraken geboekt, gemiste oproepen
- **Gesprekken** — lijst van alle oproepen met transcripties en samenvattingen
- **Agenda** — dag/week/maand weergave, per medewerker, sleep & verplaats
- **Diensten** — lijst met naam, duur en prijs (bijv. Knippen, 30 min, €35)
- **Medewerkers** — wie werkt wanneer, welke diensten ze aanbieden
- **AI Instellingen** — begroeting, stem kiezen/klonen, openingsuren, FAQ's, doorverbind-nummer
- **Abonnement** — huidig plan, minuten verbruik, facturen

### 3. Setup Wizard (onboarding)

Stap-voor-stap flow voor nieuwe klanten:

1. Sector kiezen (kapper, restaurant, dokter, garage, advocaat, anders)
2. Bedrijfsinfo invullen (naam, adres, telefoonnummer, openingsuren)
3. Diensten toevoegen (naam, duur, prijs)
4. Medewerkers toevoegen (naam, werkdagen, werkuren)
5. Stem kiezen (standaard Nederlandse stem OF eigen stem klonen in 5 minuten)
6. Telefoonnummer koppelen (Belgisch +32 nummer via Twilio)
7. Klaar — AI receptionist is actief

### 4. Ingebouwde Agenda

Dit is wat ons onderscheidt van Intavia en alle concurrenten:

- Dag/week/maand weergave
- Per medewerker (kapper Sarah, kapper Lisa, Dr. Janssen, etc.)
- Diensten met duur + prijs gekoppeld
- Klantendatabase (naam, telefoon, email, notities)
- SMS herinneringen (dag ervoor, minder no-shows)
- Online booking pagina (klanten kunnen ook online boeken)
- Wachtlijst beheer
- De AI boekt DIRECT in deze agenda — geen externe tools nodig

### 5. Backend / API

- ElevenLabs agent aanmaken per klant (via ElevenLabs API)
- Twilio nummer provisionen per klant (via Twilio API)
- Webhook: gesprek binnenkomt → loggen in database + actie uitvoeren
- Agenda API: boeken, wijzigen, annuleren
- SMS versturen via Twilio (bevestigingen, herinneringen)

### 6. Kassa-koppeling (later, voor horeca)

- API endpoint: AI stuurt bestelling → verschijnt in Vysion Horeca kassa
- Menu sync: producten uit kassa → AI kent het menu
- Apart project, wordt later toegevoegd

---

## Tech Stack

### Hosting & Deployment
- **Vercel** — hosting en automatische deployment via GitHub
- Alles wordt via GitHub → Vercel gedeployed, NIET lokaal

### Frontend
- **Next.js** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Lucide React** (icons)
- Mobile-first design

### Database
- **Supabase** — PostgreSQL, authenticatie, realtime
- Project URL: https://bkjqadaamxmwjeenzslr.supabase.co

### AI Voice
- **ElevenLabs** — Conversational AI agents
  - Text-to-speech (studio-kwaliteit)
  - Voice cloning (5 minuten opnemen → AI klinkt als jou)
  - Nederlands, Frans, Duits ondersteund
  - Native Twilio integratie
  - Kosten: ~$0.08-0.10/minuut

### Telefonie
- **Twilio** — Telefoonnummers + bellen + SMS
  - Belgische (+32), Nederlandse (+31), Duitse (+49) nummers
  - Inkomend + uitgaand bellen
  - SMS bevestigingen en herinneringen
  - Kosten: ~€0.06/min + ~€3/maand per nummer

---

## Database Structuur (Supabase)

```
businesses        — klantgegevens, sector, plan, instellingen
services          — diensten per business (knippen €35, consult €50)
staff             — medewerkers + werkuren per business
appointments      — afspraken / agenda items
calls             — alle gesprekken + transcripties + samenvatting
call_actions      — wat de AI deed (geboekt, doorverbonden, info gegeven)
subscriptions     — abonnement + minuten verbruik
phone_numbers     — Twilio nummers per klant
```

---

## Pricing

| Plan | Prijs | Minuten | Extra minuut | Doelgroep |
|------|-------|---------|-------------|-----------|
| Starter | €99/maand | 300 min | €0,40/min | Zelfstandigen |
| Pro | €149/maand | 750 min | €0,35/min | Groeiende teams |
| Business | €249/maand | 1500 min | €0,30/min | Grotere bedrijven |

**Kostprijs per klant:** ~€25/maand  
**Marge:** 75-83%  
**Eerste maand gratis, geen contract**

---

## Concurrentie in België/Nederland

| Concurrent | Land | Focus | Prijs | Nederlands? |
|-----------|------|-------|-------|-------------|
| Intavia (www.intavia.ai) | UK | Klinieken/enterprise | £199+ | Nee (Engels) |
| AskOrion (ThinkNext) | België (Leuven) | Enterprise/alarm | Offerte | Ja |
| Aiyla | Nederland | Algemeen | €212+ | Ja |
| Famulor | Duitsland/NL | Callcenter | Offerte | Ja |
| **VoxApp** | **België** | **KMO's — iedereen** | **€99+** | **Ja + FR + DE** |

**Conclusie: er is geen betaalbare, Nederlandstalige AI-receptionist met eigen agenda voor KMO's in België. Dat gat vullen wij.**

---

## Planning

| Week | Wat |
|------|-----|
| Week 1 | Website + registratie + accounts (ElevenLabs, Twilio) |
| Week 2 | Setup wizard + eerste AI agent werkend (test met eigen frituur) |
| Week 3 | Dashboard + agenda + gesprekken loggen |
| Week 4 | Kassa-koppeling + SMS + voice cloning |
| Week 5 | Testen met frituur + kapsalon |
| Week 6 | Bug fixes + polish + lancering |

---

*Document gegenereerd op 11 februari 2026*

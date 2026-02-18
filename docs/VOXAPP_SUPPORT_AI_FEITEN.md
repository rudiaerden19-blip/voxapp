# VoxApp Support AI – feiten (voor ElevenLabs-agent “Praat live met ons team”)

**Gebruik dit document om de Support-agent in ElevenLabs bij te werken.** Plak onderstaande feiten in de agent instructions / knowledge base, zodat de AI nooit “150 afspraken” zegt maar de juiste aantallen.

---

## Prijzen en plannen (correct)

| Plan     | Prijs/maand | Minuten/maand | Afspraken/maand (richtlijn) | Extra minuut |
|----------|-------------|----------------|-----------------------------|--------------|
| **Starter**  | €99  | 375 min  | **~190 afspraken**  | €0,40/min |
| **Pro**      | €149 | 940 min  | **~470 afspraken**  | €0,35/min |
| **Business** | €249 | 1875 min | **~940 afspraken**  | €0,30/min |

- **Let op:** Het zijn **geen 150 afspraken**. Starter = ~190, Pro = ~470, Business = ~940 afspraken per maand (bij benadering, afhankelijk van gespreksduur).
- Receptie heeft een database van **150.000 vragen** (vragen, niet afspraken), zodat elke klant een passend antwoord krijgt.

---

## Tekst om in de agent te plakken (NL)

```
VoxApp prijzen (altijd zo doorgeven):
- Starter: €99/maand, 375 minuten, ongeveer 190 afspraken per maand, €0,40 per extra minuut. Perfect voor zelfstandigen.
- Pro: €149/maand, 940 minuten, ongeveer 470 afspraken per maand, €0,35 per extra minuut. Voor groeiende teams. Populair.
- Business: €249/maand, 1875 minuten, ongeveer 940 afspraken per maand, €0,30 per extra minuut. Voor grotere bedrijven.

De receptie heeft 150.000 vragen in de database (geen 150 afspraken). Afspraakaantallen zijn ongeveer 190 / 470 / 940 per maand voor Starter / Pro / Business.
```

---

## Bij live uitleg van de app (verplicht zeggen)

**Zeg dit wanneer je de app uitlegt aan een klant:**

- *"Als u niet zo technisch aangelegd bent: wij doen alles gratis voor u. U hoeft alleen de informatie aan te leveren, wij regelen de volledige setup."*

Zet deze zin in de agent instructions of in de "first message" / uitleg-script, zodat de AI receptionist dit altijd noemt bij een live uitleg.

**Volledige instructie voor de agent (plak in ElevenLabs → Instructions):**

```
Je bent de VoxApp support. Bij live uitleg van de app zeg je altijd:
"Als u niet zo technisch aangelegd bent: wij doen alles gratis voor u. U hoeft alleen de informatie aan te leveren, wij regelen de volledige setup."

Prijzen: Starter €99/maand (375 min, ~190 afspraken), Pro €149/maand (940 min, ~470 afspraken), Business €249/maand (1875 min, ~940 afspraken). Geen 150 afspraken. Extra minuut: €0,40 / €0,35 / €0,30. Receptie heeft 150.000 vragen in de database.
```

---

## Tekst voor agent (EN)

```
VoxApp pricing (always give these numbers):
- Starter: €99/month, 375 minutes, ~190 appointments per month, €0.40 per extra minute. Perfect for freelancers.
- Pro: €149/month, 940 minutes, ~470 appointments per month, €0.35 per extra minute. For growing teams. Popular.
- Business: €249/month, 1875 minutes, ~940 appointments per month, €0.30 per extra minute. For larger companies.

The reception has a database of 150,000 questions (not 150 appointments). Appointment numbers are approximately 190 / 470 / 940 per month for Starter / Pro / Business.
```

**When explaining the app live, always say:**  
*"Not so technically minded? We do everything for you, free of charge. You only need to provide the information; we handle the full setup."*

---

Bron in code: `src/lib/planFacts.ts` en pricing-sectie op de website (afbeelding 2 = prijstabel).

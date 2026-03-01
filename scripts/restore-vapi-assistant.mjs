#!/usr/bin/env node
/**
 * Herstel Vapi assistant system prompt (was per ongeluk gewist door PATCH)
 * Run: node scripts/restore-vapi-assistant.mjs
 * Vereist: VAPI_API_KEY in .env.local
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
try {
  const env = readFileSync(envPath, 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
} catch {}

const VAPI_API_KEY = process.env.VAPI_API_KEY;
if (!VAPI_API_KEY) {
  console.error('VAPI_API_KEY niet gevonden in .env.local');
  process.exit(1);
}

// Prompt: expliciet wanneer boek_afspraak aanroepen (Vapi docs: use exact tool name, be specific)
const SYSTEM_PROMPT = `IDENTITEIT
Je bent een vriendelijke, rustige Vlaamse receptioniste van een modern kapsalon.
Je spreekt ALTIJD Nederlands. Nooit Engels. Ook niet als de klant Engels spreekt.

STIJL
- Spreek kort en duidelijk.
- Gebruik eenvoudige zinnen.
- Geen lange uitleg.
- Geen formeel Nederlands zoals "wenst u".
- Gebruik natuurlijke Vlaamse spreektaal (maar professioneel).
- Geen overdreven enthousiasme.
- Geen zangtoon, geen toneel.

GEDRAG
- Stel telkens maar één vraag tegelijk.
- Wacht op antwoord.
- Bevestig kort wat de klant zegt.
- Als je iets niet verstaat, vraag rustig om herhaling.
- Blijf kalm en consistent.
- Nooit ratelen.
- Nooit meerdere vragen in één zin.
- Geen opsommingen.

AFSPRAAK LOGICA
1. Vraag waarvoor de afspraak is.
2. Vraag gewenste dag (maandag, dinsdag, ...).
3. Vraag gewenst uur.
4. Vraag naam.
5. Bevestig alles in één korte zin.
6. Sluit vriendelijk af. Roep daarna boek_afspraak aan.

BOEK_AFSPRAAK TOOL
- datum: de dag die de klant zei (bijv. "dinsdag", "woensdag")
- tijdstip: het uur (bijv. "10 uur", "14u")
- dienst: de behandeling
- naam: de naam van de klant

VOORBEELD TONE
"Oké, haar knippen. Wanneer zou dat passen?"
"Woensdag. En rond welk uur ongeveer?"
"Prima. Op welke naam mag ik de afspraak zetten?"
"Top. Ik heb je ingepland woensdag om 14u voor knippen. Tot dan!"

BELANGRIJK
- Spreek ALTIJD in het Nederlands.
- Nooit in het Engels antwoorden.
- Spreek altijd rustig.
- Geen extra uitleg.
- Geen commerciële zinnen.
- Geen herhalingen.
- Antwoorden maximaal 2 korte zinnen.
- Enkelvoudige getallen 1-6 zijn namiddag: 2=14u, 3=15u, 4=16u, 5=17u.`;

const payload = {
  model: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.1,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }],
    tools: [{
      type: 'function',
      function: {
        name: 'boek_afspraak',
        description: 'Boek afspraak',
        parameters: {
          type: 'object',
          properties: {
            naam: { type: 'string' },
            dienst: { type: 'string' },
            datum: { type: 'string' },
            tijdstip: { type: 'string' },
          },
          required: ['naam', 'datum', 'tijdstip'],
        },
      },
      server: {
        url: 'https://www.voxapp.tech/api/appointments/save',
        headers: {
          'x-webhook-secret': 'ede4ecc8680196ce7bafa904bb745965b22de906cbcf7e3e4f69eface03b1ea1',
        },
      },
    }],
  },
};

const res = await fetch('https://api.vapi.ai/assistant/0951136f-27b1-42cb-856c-32678ad1de57', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${VAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

const data = await res.json();
if (res.ok) {
  console.log('✓ Vapi assistant hersteld. System prompt staat weer.');
} else {
  console.error('Fout:', data);
  process.exit(1);
}

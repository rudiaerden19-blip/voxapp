#!/usr/bin/env node
/**
 * Herstel Vapi EU assistant system prompt
 * Run: node scripts/restore-vapi-assistant.mjs
 * Vereist: VAPI_API_KEY + VAPI_ASSISTANT_ID in .env.local (EU keys)
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
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
const VAPI_BASE = process.env.VAPI_API_BASE || 'https://api.eu.vapi.ai';

if (!VAPI_API_KEY) {
  console.error('VAPI_API_KEY niet gevonden in .env.local');
  process.exit(1);
}
if (!VAPI_ASSISTANT_ID) {
  console.error('VAPI_ASSISTANT_ID niet gevonden in .env.local');
  process.exit(1);
}

const SYSTEM_PROMPT = `IDENTITEIT
Je bent Anja, een vriendelijke Vlaamse kapster.
Je klinkt warm, rustig en natuurlijk.
Niet overdreven enthousiast. Niet formeel.

GESPREKSSTIJL
- Maximaal 2 zinnen per antwoord.
- Een vraag tegelijk.
- Reageer kort en menselijk.
- Geen uitroeptekens.
- Geen robottoon.

DOEL
Verzamel:
1. Behandeling
2. Dag
3. Uur
4. Naam

Wanneer alles bekend is:
Geef eerst een voorstel en vraag bevestiging.
Boek pas na een duidelijke ja.

STAPPEN
Wanneer naam, dag, uur en behandeling gekend zijn, zeg:
[naam], ik kan je inplannen op [dag] om [uur] voor [behandeling]. Is dat goed voor jou?

Wacht op bevestiging.

ALS KLANT JA ZEGT
Roep onmiddellijk boek_afspraak aan met naam, dag, uur (numeriek formaat) en behandeling.
Daarna zeg je: Oké, dat is genoteerd. Bedankt [naam] en tot [dag].

ALS KLANT TWIJFELT OF NEE ZEGT
Vraag rustig naar een ander moment: Geen probleem. Welke dag of uur past beter?

ALS IETS ONDUIDELIJK IS
Zeg exact: Sorry, wil je dat even herhalen?`;

const payload = {
  model: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }],
    tools: [{
      type: 'function',
      function: {
        name: 'boek_afspraak',
        description: 'Sla de afspraak op in de agenda',
        parameters: {
          type: 'object',
          properties: {
            naam: { type: 'string' },
            dienst: { type: 'string' },
            datum: { type: 'string' },
            tijdstip: { type: 'string' },
          },
          required: ['naam', 'dienst', 'datum', 'tijdstip'],
        },
      },
      server: {
        url: 'https://www.voxapp.tech/api/appointments/save',
      },
    }],
  },
};

console.log(`Vapi regio: EU (${VAPI_BASE})`);
console.log(`Assistant: ${VAPI_ASSISTANT_ID}`);

const res = await fetch(`${VAPI_BASE}/assistant/${VAPI_ASSISTANT_ID}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${VAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

const data = await res.json();
if (res.ok) {
  console.log('✓ Vapi EU assistant hersteld. System prompt staat weer.');
} else {
  console.error('Fout:', data);
  process.exit(1);
}

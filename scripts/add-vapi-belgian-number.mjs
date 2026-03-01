#!/usr/bin/env node
/**
 * Voeg Belgisch nummer +32480210478 toe aan Vapi (als het ontbreekt).
 * Run: node scripts/add-vapi-belgian-number.mjs
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

const PHONE = '+32480210478';
const ASSISTANT_ID = '0951136f-27b1-42cb-856c-32678ad1de57';
const CREDENTIAL_ID = '22a72fe7-a07a-4963-a158-f34ec14397e1';

// Check of nummer al bestaat
const list = await fetch('https://api.vapi.ai/phone-number', {
  headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
});
const numbers = await list.json();
const exists = numbers.find((n) => n.number === PHONE);

if (exists) {
  console.log(`✓ Nummer ${PHONE} staat al in Vapi (${exists.name})`);
  process.exit(0);
}

// Toevoegen
const res = await fetch('https://api.vapi.ai/phone-number', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${VAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    provider: 'telnyx',
    number: PHONE,
    credentialId: CREDENTIAL_ID,
    assistantId: ASSISTANT_ID,
    name: 'VoxApp Kapper BE',
  }),
});

const data = await res.json();
if (res.ok) {
  console.log(`✓ Nummer ${PHONE} toegevoegd aan Vapi`);
} else {
  console.error('Fout:', data);
  process.exit(1);
}

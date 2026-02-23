import { GoogleGenerativeAI } from '@google/generative-ai';
import type { OrderItem } from './VoiceOrderSystem';

export interface MenuItem {
  name: string;
  price: number;
  category: string;
  is_modifier: boolean;
}

const SAUCE_FREE_CATEGORIES = new Set([
  'warme broodjes',
  'belegde broodjes',
  'bickys',
  'rundsburgers',
]);

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('Missing GEMINI_API_KEY');
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

function buildMenuBlock(menuItems: MenuItem[]): string {
  const grouped: Record<string, MenuItem[]> = {};
  for (const item of menuItems) {
    const cat = item.category || 'Overig';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const lines: string[] = [];
  for (const [cat, items] of Object.entries(grouped)) {
    const sausFree = SAUCE_FREE_CATEGORIES.has(cat.toLowerCase());
    lines.push(`[${cat}]${sausFree ? ' (saus inbegrepen)' : ''}`);
    for (const item of items) {
      const mod = item.is_modifier ? ' (saus/modifier)' : '';
      lines.push(`  - ${item.name}: €${item.price.toFixed(2)}${mod}`);
    }
  }
  return lines.join('\n');
}

const SYSTEM_PROMPT = `Je bent een bestelparser voor een Belgische frituur. Je krijgt een spraak-naar-tekst transcript van een klant die bestelt, plus het volledige menu.

TAAK: Extraheer de bestelde items als JSON array.

REGELS:
1. Match elk genoemd product op het DICHTSTBIJZIJNDE menu-item (STT maakt spelfouten: "serbela"="Cervela", "frikadellen"="Frikandel", "biggie burger"="Bicky classic", etc.)
2. Let op "special"/"speciaal" varianten — als de klant "frikandel speciaal" zegt en "Frikandel special" bestaat, kies die
3. Hoeveelheden: "twee cola" = qty 2. Geen getal = qty 1
4. Sauzen bij categorieën met "(saus inbegrepen)": modifier toevoegen aan productnaam MAAR prijs NIET optellen. Bv: "Cheese burger met samurai saus" = €6.00 (niet €7.10)
5. Sauzen bij Friet: prijs WEL optellen. Bv: "Grote friet met mayonaise" = €4.10 + €1.10 = €5.20
6. "zonder X": voeg toe aan productnaam maar tel X niet mee
7. Als je een item NIET kunt matchen, sla het over

Antwoord ALLEEN met een JSON array, geen uitleg:
[{"product":"Productnaam","quantity":1,"price":5.20}]`;

export async function extractWithGemini(
  transcript: string,
  menuItems: MenuItem[],
): Promise<OrderItem[] | null> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 500,
      },
    });

    const menuBlock = buildMenuBlock(menuItems);
    const prompt = `${SYSTEM_PROMPT}\n\nMENU:\n${menuBlock}\n\nTRANSCRIPT: "${transcript}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log(JSON.stringify({ _tag: 'GEMINI_EXTRACT', status: 'no_json', raw: text }));
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      product: string;
      quantity: number;
      price: number;
    }>;

    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const items: OrderItem[] = parsed
      .filter(i => i.product && i.quantity > 0 && i.price >= 0)
      .map(i => ({
        product: i.product,
        quantity: i.quantity,
        price: Math.round(i.price * 100) / 100,
      }));

    console.log(JSON.stringify({
      _tag: 'GEMINI_EXTRACT',
      status: 'success',
      items_count: items.length,
      items,
    }));

    return items.length > 0 ? items : null;
  } catch (err) {
    console.log(JSON.stringify({
      _tag: 'GEMINI_EXTRACT',
      status: 'error',
      error: String(err),
    }));
    return null;
  }
}

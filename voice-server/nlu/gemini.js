// Gemini JSON-only extraction. No prices. No flow control.

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getModel() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { temperature: 0, maxOutputTokens: 300 },
  });
}

const EXTRACT_PROMPT = `Je bent een bestelparser voor een Belgische frituur.
Je krijgt een transcript van een klant die bestelt.

TAAK: Extraheer ALLEEN de bestelde producten en hoeveelheden.

REGELS:
1. Match elk product op het DICHTSTBIJZIJNDE item uit de PRODUCTEN lijst
2. Gebruik de EXACTE productnaam uit de lijst, NIET je eigen versie
3. Hoeveelheden: "twee cola" = quantity 2. Geen getal = quantity 1
4. Sauzen/opties uit de SAUZEN lijst gaan in "options" array
5. "zonder X" gaat ook in options als "zonder X"
6. GEEN prijzen berekenen — dat doet het systeem
7. Als je iets NIET kunt matchen aan de lijst, sla het OVER

Return ONLY valid JSON. No text outside JSON.

Output formaat:
{"intent":"order","items":[{"product":"Exacte Productnaam","quantity":1,"options":["Mayonaise"]}]}`;

const NAME_PHONE_PROMPT = `Je krijgt een transcript van iemand die zijn naam en telefoonnummer geeft.

TAAK: Extraheer naam en telefoonnummer.

REGELS:
1. Naam: voornaam (eventueel achternaam). STT fouten: "Relie"="Rudi", "Freddie"="Frederic"
2. Telefoonnummer: gesproken als woorden omzetten naar cijfers
3. Als je iets niet vindt, geef null

Return ONLY valid JSON:
{"name":"Voornaam","phone":"0492129383"}`;

function buildMenuList(menuItems) {
  return menuItems
    .filter(i => !i.is_modifier)
    .map(i => `- ${i.name}`)
    .join('\n');
}

function buildModifierList(menuItems) {
  return menuItems
    .filter(i => i.is_modifier)
    .map(i => `- ${i.name}`)
    .join('\n');
}

async function extractItems(transcript, menuItems) {
  try {
    const model = getModel();
    const products = buildMenuList(menuItems);
    const modifiers = buildModifierList(menuItems);

    const prompt = `${EXTRACT_PROMPT}

PRODUCTEN:
${products}

SAUZEN/OPTIES:
${modifiers}

TRANSCRIPT: "${transcript}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log(JSON.stringify({ _tag: 'GEMINI', status: 'no_json', raw: text.slice(0, 200) }));
      const retry = await model.generateContent(prompt + '\n\nREMINDER: Return ONLY valid JSON.');
      const retryText = retry.response.text().trim();
      jsonMatch = retryText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
    }

    return parseExtraction(jsonMatch[0]);
  } catch (err) {
    console.log(JSON.stringify({ _tag: 'GEMINI', status: 'error', error: String(err) }));
    return null;
  }
}

function parseExtraction(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    const intent = parsed.intent === 'order' ? 'order' : (parsed.intent === 'info' ? 'info' : 'other');

    const items = [];
    if (Array.isArray(parsed.items)) {
      for (const i of parsed.items) {
        if (i.product && typeof i.product === 'string') {
          items.push({
            product: i.product,
            quantity: typeof i.quantity === 'number' && i.quantity > 0 ? i.quantity : 1,
            options: Array.isArray(i.options) ? i.options.filter(o => typeof o === 'string') : [],
          });
        }
      }
    }

    console.log(JSON.stringify({ _tag: 'GEMINI', status: 'ok', intent, items_count: items.length, items }));
    return { intent, items };
  } catch {
    console.log(JSON.stringify({ _tag: 'GEMINI', status: 'parse_error', raw: jsonStr.slice(0, 200) }));
    return null;
  }
}

async function extractNamePhone(transcript) {
  try {
    const model = getModel();
    const prompt = `${NAME_PHONE_PROMPT}\n\nTRANSCRIPT: "${transcript}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const name = parsed.name && parsed.name.length >= 2 ? parsed.name : null;
    const phone = parsed.phone && parsed.phone.replace(/\D/g, '').length >= 9
      ? parsed.phone.replace(/\D/g, '')
      : null;

    console.log(JSON.stringify({ _tag: 'GEMINI_NP', name, phone }));
    return { name, phone };
  } catch (err) {
    console.log(JSON.stringify({ _tag: 'GEMINI_NP', status: 'error', error: String(err) }));
    return null;
  }
}

module.exports = { extractItems, extractNamePhone };

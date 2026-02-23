// ============================================================
// DETERMINISTIC PRODUCT MAPPING LAYER
// Geen AI. Alleen exact match + controlled synonym list.
// Elke productnaam MOET matchen tegen de catalogus.
// ============================================================

import type { GeminiItem } from './geminiExtractor';

export interface MappedItem {
  product: string;     // Exacte naam uit catalogus
  quantity: number;
  price: number;       // Prijs uit catalogus, NIET van Gemini
  options: string[];   // Gematche sauzen/modifiers
  unresolved: boolean; // true als product niet gevonden
}

export interface ProductCatalog {
  items: Map<string, number>;       // name_lower → price
  modifiers: Map<string, number>;   // modifier_lower → price
  synonyms: Map<string, string>;    // synonym_lower → canonical_name_lower
}

// ============================================================
// SYNONYM TABLE — controlled, handmatig onderhouden
// ============================================================

const SYNONYM_TABLE: Record<string, string> = {
  // Friet
  'frit': 'friet',
  'frieten': 'friet',
  'patat': 'friet',

  // Bicky
  'bicky': 'bicky classic',
  'bicky burger': 'bicky classic',
  'bickyburger': 'bicky classic',

  // Cervela
  'cervella': 'cervela',
  'cerbela': 'cervela',

  // Frikandel
  'frikadel': 'frikandel',
  'fricandel': 'frikandel',

  // Boulet
  'boulette': 'boulet',
  'gehaktbal': 'boulet',

  // Sauzen
  'mayo': 'mayonaise',
  'ketchup': 'tomaten ketchup',
  'samurai': 'samurai saus',
  'andalouse': 'andalouse saus',
  'cocktail': 'cocktail saus',
  'joppie': 'joppie saus',
  'bbq': 'bbq saus',
  'mammouth': 'mammouth saus',
  'amerikaanse': 'amerikaanse donker',

  // Dranken
  'coca cola': 'cola',
  'coca-cola': 'cola',
  'coke': 'cola',
  'red bull': 'redbull',
};

// ============================================================
// BUILD CATALOG FROM DATABASE
// ============================================================

export function buildCatalog(
  menuItems: { name: string; price: number; is_modifier: boolean }[]
): ProductCatalog {
  const items = new Map<string, number>();
  const modifiers = new Map<string, number>();
  const synonyms = new Map<string, string>();

  for (const item of menuItems) {
    const lower = item.name.toLowerCase();
    if (item.is_modifier) {
      modifiers.set(lower, item.price);
    } else {
      items.set(lower, item.price);
    }
  }

  // Add controlled synonyms
  for (const [syn, canonical] of Object.entries(SYNONYM_TABLE)) {
    if (items.has(canonical) || modifiers.has(canonical)) {
      synonyms.set(syn, canonical);
    }
  }

  return { items, modifiers, synonyms };
}

// ============================================================
// MAP GEMINI OUTPUT TO CATALOG — DETERMINISTISCH
// ============================================================

export function mapProducts(
  geminiItems: GeminiItem[],
  catalog: ProductCatalog,
): MappedItem[] {
  const results: MappedItem[] = [];

  for (const gi of geminiItems) {
    const productLower = gi.product.toLowerCase().trim();

    // Step 1: Exact match
    let matchedName = findInCatalog(productLower, catalog);

    // Step 2: Synonym match
    if (!matchedName) {
      const syn = catalog.synonyms.get(productLower);
      if (syn) matchedName = syn;
    }

    // Step 3: Partial match (product naam bevat een catalogus item)
    if (!matchedName) {
      matchedName = partialMatch(productLower, catalog);
    }

    if (!matchedName) {
      // UNRESOLVED — product niet in catalogus
      console.log(JSON.stringify({
        _tag: 'MAPPER', status: 'unresolved',
        gemini_product: gi.product, attempted: productLower,
      }));
      results.push({
        product: gi.product,
        quantity: gi.quantity,
        price: 0,
        options: [],
        unresolved: true,
      });
      continue;
    }

    // Prijs uit catalogus
    const price = catalog.items.get(matchedName) ?? catalog.modifiers.get(matchedName) ?? 0;

    // Map options (sauzen)
    const mappedOptions: { name: string; price: number }[] = [];
    for (const opt of gi.options) {
      const optLower = opt.toLowerCase().trim();
      if (optLower.startsWith('zonder')) {
        mappedOptions.push({ name: opt, price: 0 });
        continue;
      }

      let optMatch = catalog.modifiers.get(optLower)
        ? optLower
        : catalog.synonyms.get(optLower) || null;

      if (!optMatch) {
        // Probeer partial match op modifiers
        for (const [modName] of catalog.modifiers) {
          if (optLower.includes(modName) || modName.includes(optLower)) {
            optMatch = modName;
            break;
          }
        }
      }

      if (optMatch && catalog.modifiers.has(optMatch)) {
        mappedOptions.push({ name: optMatch, price: catalog.modifiers.get(optMatch)! });
      }
    }

    // Totaalprijs: product + opties
    const optionsPrice = mappedOptions.reduce((sum, o) => sum + o.price, 0);
    const totalPrice = price + optionsPrice;

    // Display naam: "Grote friet met Mayonaise"
    const displayParts = [matchedName];
    for (const o of mappedOptions) {
      displayParts.push(o.name);
    }
    const displayName = displayParts.join(' met ');

    console.log(JSON.stringify({
      _tag: 'MAPPER', status: 'matched',
      gemini_product: gi.product, matched: matchedName,
      price, options: mappedOptions, total: totalPrice,
    }));

    // Merge duplicates
    const existing = results.find(r => r.product === displayName && !r.unresolved);
    if (existing) {
      existing.quantity += gi.quantity;
    } else {
      results.push({
        product: displayName,
        quantity: gi.quantity,
        price: totalPrice,
        options: mappedOptions.map(o => o.name),
        unresolved: false,
      });
    }
  }

  return results;
}

// ============================================================
// HELPERS
// ============================================================

function findInCatalog(name: string, catalog: ProductCatalog): string | null {
  if (catalog.items.has(name)) return name;
  if (catalog.modifiers.has(name)) return name;
  return null;
}

function partialMatch(input: string, catalog: ProductCatalog): string | null {
  // Zoek langste match eerst
  let bestMatch: string | null = null;
  let bestLen = 0;

  for (const [itemName] of catalog.items) {
    if (input.includes(itemName) && itemName.length > bestLen) {
      bestMatch = itemName;
      bestLen = itemName.length;
    }
    if (itemName.includes(input) && input.length > bestLen) {
      bestMatch = itemName;
      bestLen = input.length;
    }
  }

  return bestMatch;
}

// Deterministic product mapping. No AI. Exact match + synonym list.

const SYNONYM_TABLE = {
  'frit': 'friet',
  'frieten': 'friet',
  'patat': 'friet',
  'bicky': 'bicky classic',
  'bicky burger': 'bicky classic',
  'bickyburger': 'bicky classic',
  'cervella': 'cervela',
  'cerbela': 'cervela',
  'frikadel': 'frikandel',
  'fricandel': 'frikandel',
  'boulette': 'boulet',
  'gehaktbal': 'boulet',
  'mayo': 'mayonaise',
  'ketchup': 'tomaten ketchup',
  'samurai': 'samurai saus',
  'andalouse': 'andalouse saus',
  'cocktail': 'cocktail saus',
  'joppie': 'joppie saus',
  'bbq': 'bbq saus',
  'mammouth': 'mammouth saus',
  'amerikaanse': 'amerikaanse donker',
  'coca cola': 'cola',
  'coca-cola': 'cola',
  'coke': 'cola',
  'red bull': 'redbull',
};

function buildCatalog(menuItems) {
  const items = new Map();
  const modifiers = new Map();
  const synonyms = new Map();

  for (const item of menuItems) {
    const lower = item.name.toLowerCase();
    if (item.is_modifier) {
      modifiers.set(lower, item.price);
    } else {
      items.set(lower, item.price);
    }
  }

  for (const [syn, canonical] of Object.entries(SYNONYM_TABLE)) {
    if (items.has(canonical) || modifiers.has(canonical)) {
      synonyms.set(syn, canonical);
    }
  }

  return { items, modifiers, synonyms };
}

function mapProducts(geminiItems, catalog) {
  const results = [];

  for (const gi of geminiItems) {
    const productLower = gi.product.toLowerCase().trim();

    // Step 1: Exact match
    let matchedName = null;
    if (catalog.items.has(productLower)) matchedName = productLower;
    else if (catalog.modifiers.has(productLower)) matchedName = productLower;

    // Step 2: Synonym match
    if (!matchedName) {
      const syn = catalog.synonyms.get(productLower);
      if (syn) matchedName = syn;
    }

    // Step 3: Partial match
    if (!matchedName) {
      let bestLen = 0;
      for (const [itemName] of catalog.items) {
        if (productLower.includes(itemName) && itemName.length > bestLen) {
          matchedName = itemName;
          bestLen = itemName.length;
        }
        if (itemName.includes(productLower) && productLower.length > bestLen) {
          matchedName = itemName;
          bestLen = productLower.length;
        }
      }
    }

    if (!matchedName) {
      console.log(JSON.stringify({ _tag: 'MAPPER', status: 'unresolved', product: gi.product }));
      results.push({
        product: gi.product,
        quantity: gi.quantity,
        price: 0,
        options: [],
        unresolved: true,
      });
      continue;
    }

    const price = catalog.items.get(matchedName) ?? catalog.modifiers.get(matchedName) ?? 0;

    // Map options (sauzen)
    const mappedOptions = [];
    for (const opt of gi.options) {
      const optLower = opt.toLowerCase().trim();
      if (optLower.startsWith('zonder')) {
        mappedOptions.push({ name: opt, price: 0 });
        continue;
      }

      let optMatch = catalog.modifiers.has(optLower) ? optLower : null;
      if (!optMatch) optMatch = catalog.synonyms.get(optLower) || null;
      if (!optMatch) {
        for (const [modName] of catalog.modifiers) {
          if (optLower.includes(modName) || modName.includes(optLower)) {
            optMatch = modName;
            break;
          }
        }
      }

      if (optMatch && catalog.modifiers.has(optMatch)) {
        mappedOptions.push({ name: optMatch, price: catalog.modifiers.get(optMatch) });
      }
    }

    const optionsPrice = mappedOptions.reduce((sum, o) => sum + o.price, 0);
    const totalPrice = price + optionsPrice;

    const displayParts = [matchedName];
    for (const o of mappedOptions) {
      displayParts.push(o.name);
    }
    const displayName = displayParts.join(' met ');

    console.log(JSON.stringify({
      _tag: 'MAPPER', status: 'matched',
      gemini: gi.product, matched: matchedName, price: totalPrice,
    }));

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

module.exports = { buildCatalog, mapProducts };

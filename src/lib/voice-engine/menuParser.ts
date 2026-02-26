import { MenuItem, ParsedItem } from './types';

const NUMBER_WORDS: Record<string, number> = {
  een: 1, één: 1, eentje: 1,
  twee: 2, drie: 3, vier: 4, vijf: 5,
  zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10,
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?]/g, '');
}

function extractQty(textBefore: string): number {
  const words = textBefore.trim().split(/\s+/);
  const last = words[words.length - 1];
  if (!last) return 1;
  if (/^\d+$/.test(last)) return parseInt(last, 10);
  return NUMBER_WORDS[last] ?? 1;
}

/**
 * Parses order items from a transcript using menu item names.
 * Sorted by name length (longest first) to avoid partial matches.
 * Removes matched text from the string to avoid double-counting.
 */
export function parseMenuItems(transcript: string, menu: MenuItem[]): ParsedItem[] {
  let text = normalize(transcript);
  const results: ParsedItem[] = [];

  // Longest names first to avoid partial match (e.g. "frikandel xxl special" before "frikandel")
  const sorted = [...menu]
    .filter(m => m.is_available)
    .sort((a, b) => b.name.length - a.name.length);

  for (const item of sorted) {
    const norm = normalize(item.name);
    const idx = text.indexOf(norm);
    if (idx === -1) continue;

    const before = text.substring(0, idx);
    const qty = extractQty(before);

    results.push({ id: item.id, name: item.name, price: item.price, qty });

    // Remove matched portion so it's not double-counted
    text = text.substring(0, idx) + text.substring(idx + norm.length);
  }

  return results;
}

/**
 * Detects yes/no from user speech.
 */
export function detectYesNo(text: string): 'yes' | 'no' | 'unknown' {
  const t = normalize(text);
  const yesWords = ['ja', 'jep', 'jawel', 'zeker', 'graag', 'aub', 'klopt', 'correct', 'goed', 'ok'];
  const noWords = ['nee', 'neen', 'niets', 'niks', 'dat is alles', 'dat was het', 'zo', 'genoeg'];
  if (yesWords.some(w => t.includes(w))) return 'yes';
  if (noWords.some(w => t.includes(w))) return 'no';
  return 'unknown';
}

/**
 * Detects pickup or delivery from user speech.
 */
export function detectDelivery(text: string): 'pickup' | 'delivery' | 'unknown' {
  const t = normalize(text);
  if (t.includes('leveren') || t.includes('levering') || t.includes('bezorgen') || t.includes('bezorgd')) return 'delivery';
  if (t.includes('afhalen') || t.includes('ophalen') || t.includes('zelf') || t.includes('kom ik')) return 'pickup';
  return 'unknown';
}

/**
 * Extracts a name from user speech (simple: capitalize first letters).
 * In practice this is whatever the user says in the GET_NAME state.
 */
export function extractName(text: string): string {
  return text
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

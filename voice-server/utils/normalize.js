// Deterministic transcript normalization. No AI. Dictionary only.

const PHONETIC_MAP = [
  ['grote frit', 'grote friet'],
  ['grote wit', 'grote friet'],
  ['grote fan', 'grote friet'],
  ['klein frit', 'kleine friet'],
  ['klein friet', 'kleine friet'],
  ['middel friet', 'middelfriet'],
  ['middel frit', 'middelfriet'],
  ['kinder frit', 'kinderfriet'],
  ['kinder friet', 'kinderfriet'],
  ['friet speciaal', 'friet special'],
  ['frieten', 'friet'],

  ['gebakken servla', 'cervela'],
  ['servelade', 'cervela'],
  ['cervelat', 'cervela'],
  ['cervella', 'cervela'],
  ['cerbéla', 'cervela'],
  ['cerbella', 'cervela'],
  ['cebella', 'cervela'],
  ['cerbela', 'cervela'],
  ['serbela', 'cervela'],
  ['servela', 'cervela'],
  ['serval', 'cervela'],
  ['servalade', 'cervela'],
  ['cervelak', 'cervela'],
  ['serblad', 'cervela'],
  ['serreblad', 'cervela'],

  ['frikadellen special', 'frikandel special'],
  ['frikadellen', 'frikandel'],
  ['frikadelle special', 'frikandel special'],
  ['frikadelle', 'frikandel'],
  ['frikadel special', 'frikandel special'],
  ['frikadel', 'frikandel'],
  ['fricandel', 'frikandel'],
  ['frikandellen', 'frikandel'],

  ['koude boulet', 'boulet'],
  ['gebakken boulet', 'boulet'],
  ['boelet', 'boulet'],
  ['boelett', 'boulet'],
  ['boulette', 'boulet'],

  ['bikkieburger', 'bicky classic'],
  ['biggie burger', 'bicky classic'],
  ['bickyburger', 'bicky classic'],
  ['bicky burger', 'bicky classic'],
  ['bikkie', 'bicky classic'],

  ['amerikaanse burger', 'amerikaan'],
  ['cheeseburger', 'cheese burger'],
  ['hawai burger', 'hawaii burger'],

  ['zoute mayonaise', 'zoete mayonaise'],
  ['zoute mayo', 'zoete mayonaise'],
  ['mayo', 'mayonaise'],
  ['tomatenketchup', 'tomaten ketchup'],
  ['curryketchup', 'curry ketchup'],
  ['ketchup', 'tomaten ketchup'],

  ['speciaal', 'special'],

  ['saté', 'sate'],
  ['sateh', 'sate'],
  ['satay', 'sate'],

  ['bammi schijf', 'bamischijf'],
  ['bami schijf', 'bamischijf'],
  ['mexicano xl', 'mexicano xxl'],
  ['frikandel xl', 'frikandel xxl'],
  ['bitterbal', 'bitterballen 6x'],
  ['bitterballen', 'bitterballen 6x'],
  ['viannel', 'viandel'],
  ['viandelle', 'viandel'],
  ['red bull', 'redbull'],
  ['ice thee', 'ice tea'],
  ['ijsthee', 'ice tea'],
  ['capri sun', 'caprisun'],
  ['spa blauw', 'spa bruis'],
];

const SORTED_MAP = [...PHONETIC_MAP].sort((a, b) => b[0].length - a[0].length);

function normalizeTranscript(text) {
  let t = text.toLowerCase().trim();
  for (const [wrong, correct] of SORTED_MAP) {
    if (t.includes(correct) && correct.length > wrong.length) continue;
    const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp(escaped, 'g'), correct);
  }
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t;
}

module.exports = { normalizeTranscript };

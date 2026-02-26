/**
 * ============================================================
 *  STEM-SCRIPT — Alles wat Anja zegt
 * ============================================================
 *
 *  DIT IS HET ENIGE BESTAND DAT JE MOET AANPASSEN.
 *
 *  Hoe werkt het?
 *  → Pas een zin aan hieronder
 *  → Sla op → push naar GitHub
 *  → Vercel deployt automatisch
 *  → Anja spreekt de nieuwe tekst (nieuw gegenereerd door ElevenLabs)
 *
 *  Regels voor goede uitspraak:
 *  - Schrijf zoals je praat, niet zoals je schrijft
 *  - Korte zinnen klinken natuurlijker dan lange
 *  - Vermijd afkortingen (schrijf "euro" niet "€" in zinnen)
 *  - Getallen schrijf je voluit: "drie euro vijftig" klinkt beter
 *  - ${naam} wordt vervangen door de naam van de klant
 *  - ${zaak} wordt vervangen door de naam van de zaak
 * ============================================================
 */

type DeliveryType = 'pickup' | 'delivery' | null;
interface ParsedItem { id: string; name: string; price: number; qty: number; }

export const SCRIPT = {

  // ── 1. BEGROETING ───────────────────────────────────────────
  //    Eerste zin die Anja zegt als de klant belt.
  //    ${zaak} = naam van de zaak (staat in Supabase)
  begroeting: (zaak: string) =>
    `Goeiedag! ${zaak}, wat mag het zijn?`,


  // ── 2. NOG IETS? ────────────────────────────────────────────
  //    Na elk besteld artikel vraagt Anja dit.
  nogIets: () =>
    `En nog iets daarbij?`,


  // ── 3. AFHALEN OF LEVEREN ───────────────────────────────────
  //    Gevraagd nadat de klant klaar is met bestellen.
  afhalenOfLeveren: () =>
    `Is dat afhalen of wil je dat laten leveren?`,


  // ── 4. NAAM VRAGEN ──────────────────────────────────────────
  //    Om de bestelling op naam te zetten.
  naamVragen: () =>
    `Op welke naam mag ik dat zetten?`,


  // ── 5. ADRES VRAGEN (alleen bij levering) ───────────────────
  //    ${naam} = naam van de klant
  adresVragen: (naam: string) =>
    `En op welk adres mogen we leveren, ${naam}?`,


  // ── 6. BEVESTIGING (bestelling overlopen) ───────────────────
  //    Anja leest de volledige bestelling voor en vraagt bevestiging.
  //    Pas de zinsbouw aan maar houd ${items}, ${totaal}, ${levering}
  bevestiging: (items: ParsedItem[], type: DeliveryType, naam: string, adres: string | null) => {
    const itemsText = items
      .map(i => `${spelGetal(i.qty)} ${i.name.toLowerCase()}`)
      .join(', ');
    const totaal = items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2).replace('.', ',');
    const leveringText = type === 'delivery'
      ? `en dat wordt geleverd op ${adres}`
      : `en dat wordt afgehaald op naam van ${naam}`;
    return `Oké ${naam}, ik herhaal: ${itemsText}, totaal ${totaal} euro, ${leveringText}. Klopt dat?`;
  },


  // ── 7. KLAAR — AFHALEN ──────────────────────────────────────
  //    Eindbevestiging bij afhalen.
  klaarAfhalen: (naam: string) =>
    `Super, ${naam}! Uw bestelling is geregistreerd. We zien u zo!`,


  // ── 8. KLAAR — LEVERING ─────────────────────────────────────
  //    Eindbevestiging bij levering.
  klaarLevering: (naam: string) =>
    `Super, ${naam}! We leveren dat zo snel mogelijk. Bedankt!`,


  // ── 9. NIET VERSTAAN ────────────────────────────────────────
  //    Als Anja de klant niet heeft gehoord.
  nietVerstaan: () =>
    `Excuseer, ik heb dat niet goed gehoord. Kunt u dat herhalen?`,


  // ── 10. ARTIKEL NIET GEVONDEN ────────────────────────────────
  //    Als het item niet in het menu staat.
  artikelNietGevonden: () =>
    `Dat heb ik niet gevonden in ons aanbod. Wat wenst u precies?`,


  // ── 11. OPNIEUW BEGINNEN ─────────────────────────────────────
  //    Als de klant de bestelling wil annuleren en opnieuw beginnen.
  opnieuwBeginnen: (zaak: string) =>
    `Geen probleem, we beginnen opnieuw. ${zaak}, wat mag het zijn?`,

} as const;


// ─── Hulpfunctie: getal naar woord ───────────────────────────
//  1 → "een", 2 → "twee", etc.
//  Zo klinkt het natuurlijker in spraak.
function spelGetal(n: number): string {
  const woorden: Record<number, string> = {
    1: 'een', 2: 'twee', 3: 'drie', 4: 'vier', 5: 'vijf',
    6: 'zes', 7: 'zeven', 8: 'acht', 9: 'negen', 10: 'tien',
  };
  return woorden[n] ?? String(n);
}

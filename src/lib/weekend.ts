// Ricava le date di un articolo "Il weekend" dal suo slug, es. `weekend-23-25-ottobre-2026`
// o `weekend-30-ottobre-1-novembre-2026`. Restituisce date ISO (YYYY-MM-DD) o null se lo slug non torna.
const MESI = [
  'gennaio',
  'febbraio',
  'marzo',
  'aprile',
  'maggio',
  'giugno',
  'luglio',
  'agosto',
  'settembre',
  'ottobre',
  'novembre',
  'dicembre',
];

export function weekendDatesFromSlug(slug: string): { inizio: string; fine: string } | null {
  const m = slug.match(/^weekend-(\d{1,2})(?:-([a-z]+))?-(\d{1,2})-([a-z]+)-(\d{4})$/);
  if (!m) return null;
  const [, g1, mese1, g2, mese2, anno] = m;
  const m2 = MESI.indexOf(mese2);
  const m1 = mese1 ? MESI.indexOf(mese1) : m2;
  if (m1 < 0 || m2 < 0) return null;
  const annoFine = Number(anno);
  // Un weekend a cavallo dell'anno (es. 31 dicembre - 2 gennaio) inizia l'anno prima
  const annoInizio = m1 > m2 ? annoFine - 1 : annoFine;
  const iso = (y: number, mese: number, g: string) => `${y}-${String(mese + 1).padStart(2, '0')}-${g.padStart(2, '0')}`;
  return { inizio: iso(annoInizio, m1, g1), fine: iso(annoFine, m2, g2) };
}

// Dice se un weekend è passato, in corso o ancora da venire rispetto a `oggi` (data ISO).
export function statoWeekend(inizio: string, fine: string, oggi: string): 'passato' | 'corrente' | 'futuro' {
  if (fine < oggi) return 'passato';
  return inizio > oggi ? 'futuro' : 'corrente';
}

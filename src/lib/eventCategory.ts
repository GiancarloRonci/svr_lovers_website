// Maps an event's tipologiaEvento (Italian or English) to a CSS class for its coloured tag.
const categorie: [string, string[]][] = [
  ['sagra', ['sagra', 'food']],
  ['concerto', ['concert']],
  ['cultura', ['cultural', 'scientific', 'scientifico']],
  ['religioso', ['religio']],
  ['sport', ['sport']],
  ['escursione', ['escursion', 'hike']],
  ['teatro', ['teatr', 'theatr', 'spettacolo']],
  ['cittadino', ['cittadin', 'civic']],
  ['auto', ['auto', 'car rally']],
];

export function tagClass(tipologia: string | undefined): string {
  const t = tipologia?.toLowerCase() ?? '';
  const trovata = categorie.find(([, chiavi]) => chiavi.some((k) => t.includes(k)));
  return trovata ? `tag tag--${trovata[0]}` : 'tag';
}

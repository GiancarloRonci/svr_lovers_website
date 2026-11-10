// Chi ha contribuito a una scheda (campo `contributori` dei luoghi): SVR Lovers c'è sempre,
// gli altri si aggiungono nel frontmatter, es. `contributori: ["Agapito Fornari"]`.
export const CONTRIBUTORE_PREDEFINITO = 'SVR Lovers';

/** "SVR Lovers e Agapito Fornari" / "SVR Lovers and Agapito Fornari". */
export function formatContributori(altri: string[] = [], lang: 'it' | 'en'): string {
  const nomi = [CONTRIBUTORE_PREDEFINITO, ...altri.filter((n) => n !== CONTRIBUTORE_PREDEFINITO)];
  if (nomi.length === 1) return nomi[0];
  const e = lang === 'it' ? ' e ' : ' and ';
  return nomi.slice(0, -1).join(', ') + e + nomi[nomi.length - 1];
}

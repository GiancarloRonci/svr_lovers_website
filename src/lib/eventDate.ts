// Luogo dell'evento senza la provincia e senza il comune finale, già mostrato a parte:
// "Teatro Cinema Italia, Genazzano (Roma)" -> "Teatro Cinema Italia"; "Subiaco (Roma)" -> undefined
export function luogoSenzaComune(luogo: string | undefined, comune: string): string | undefined {
  if (!luogo) return undefined;
  let s = luogo.replace(/\s*\((Roma|Rome)\)\s*$/, '').trim();
  if (s.endsWith(`, ${comune}`)) s = s.slice(0, -(comune.length + 2)).trim();
  return s && s !== comune ? s : undefined;
}

export function formatEventDate(dataInizio: Date, dataFine: Date | undefined, locale: string): string {
  const fullOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

  if (!dataFine || dataFine.valueOf() === dataInizio.valueOf()) {
    return dataInizio.toLocaleDateString(locale, fullOptions);
  }

  const sameYear = dataInizio.getFullYear() === dataFine.getFullYear();
  const sameMonth = sameYear && dataInizio.getMonth() === dataFine.getMonth();

  const startOptions: Intl.DateTimeFormatOptions = sameMonth
    ? { day: 'numeric' }
    : sameYear
      ? { day: 'numeric', month: 'long' }
      : fullOptions;

  return `${dataInizio.toLocaleDateString(locale, startOptions)} - ${dataFine.toLocaleDateString(locale, fullOptions)}`;
}

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

export function formatDriveTime(minutiAuto: number | undefined, lang: 'it' | 'en'): string | undefined {
  if (minutiAuto === undefined) return undefined;
  return lang === 'it'
    ? `circa ${minutiAuto} min in auto da San Vito`
    : `about ${minutiAuto} min by car from San Vito`;
}

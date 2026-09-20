import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const cache = new Map<string, Date | undefined>();

/**
 * Data dell'ultimo commit che ha toccato il file (e la cartella di foto omonima, se esiste).
 * Restituisce undefined se git non è disponibile o il file non è ancora stato committato.
 */
export function getLastModified(filePath: string | undefined): Date | undefined {
  if (!filePath) return undefined;
  if (cache.has(filePath)) return cache.get(filePath);

  const paths = [filePath];
  const photoDir = filePath.replace(/\.md$/, '');
  if (photoDir !== filePath && existsSync(photoDir)) paths.push(photoDir);

  let result: Date | undefined;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...paths], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (out) result = new Date(out);
  } catch {
    // git not available or not a repo
  }

  cache.set(filePath, result);
  return result;
}

export function formatLastModified(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Data dell'ultimo commit che ha toccato un contenuto del sito (src/content). */
export function getSiteLastModified(): Date | undefined {
  return getLastModified('src/content');
}

export function formatLastModifiedFull(date: Date, locale: string): string {
  return date.toLocaleString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Rome',
  });
}

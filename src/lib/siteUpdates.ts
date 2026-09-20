import { execFileSync } from 'node:child_process';
import { getCollection } from 'astro:content';

type Lang = 'it' | 'en';

/** Cartella in src/content -> nome della collection e segmento di URL. */
const sections = {
  news: { collection: 'news', url: 'news', label: { it: 'News', en: 'News' } },
  storia: { collection: 'storia', url: 'storia', label: { it: 'Storia', en: 'History' } },
  leggende: { collection: 'leggende', url: 'leggende', label: { it: 'Leggende', en: 'Legends' } },
  luoghi: { collection: 'luoghi', url: 'luoghi', label: { it: 'Luoghi', en: 'Places' } },
  percorsi: { collection: 'percorsi', url: 'percorsi', label: { it: 'Percorsi', en: 'Trails' } },
  'cosa-fare': { collection: 'cosaFare', url: 'cosa-fare', label: { it: 'Cosa fare', en: 'What to Do' } },
  eventi: { collection: 'eventi', url: 'eventi', label: { it: 'Eventi & Feste', en: 'Events & Festivals' } },
  soggiorno: { collection: 'soggiorno', url: 'soggiorno', label: { it: 'Dove Soggiornare', en: 'Where to Stay' } },
  associazione: { collection: 'associazione', url: 'associazione', label: { it: 'Circolo Culturale', en: 'Cultural Club' } },
} as const;

type SectionKey = keyof typeof sections;

export interface SiteUpdate {
  title: string;
  section: string;
  /** Percorso relativo alla base del sito, es. `luoghi/fonte-canale/`. */
  href: string;
  subject: string;
  date: Date;
}

interface RawChange {
  section: SectionKey;
  id: string;
  subject: string;
  date: Date;
}

const RECORD = '\x1e';
const FIELD = '\x1f';
/** Un commit che contiene questo testo (nel titolo o nel corpo) non compare nelle news del sito. */
const HIDDEN_MARKER = /\[no-log\]/i;
const pathPattern = /^src\/content\/([a-z-]+?)(?:-en)?\/([^/]+?)(?:\.md|\/.*)$/;

function readChanges(): RawChange[] {
  let out = '';
  try {
    out = execFileSync(
      'git',
      [
        '-c', 'core.quotepath=false',
        'log', '--name-only', '--diff-filter=AMR',
        `--format=${RECORD}%cI${FIELD}%s${FIELD}%B${FIELD}`,
        '--', 'src/content',
      ],
      { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }
    ).toString();
  } catch {
    return [];
  }

  const changes: RawChange[] = [];
  for (const record of out.split(RECORD).filter((r) => r.trim())) {
    const [iso, subject, message, fileList] = record.split(FIELD);
    if (HIDDEN_MARKER.test(message)) continue;
    const seen = new Set<string>();
    for (const file of (fileList ?? '').split('\n')) {
      const m = pathPattern.exec(file.trim());
      if (!m || !(m[1] in sections)) continue;
      const key = `${m[1]}/${m[2]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      changes.push({ section: m[1] as SectionKey, id: m[2], subject, date: new Date(iso) });
    }
  }
  return changes;
}

const changes = readChanges();

/**
 * Ultimi aggiornamenti delle pagine di contenuto, dal più recente, ricavati dalla cronologia git.
 * Le pagine che non esistono più (contenuti rimossi) vengono escluse.
 */
export async function getSiteUpdates(lang: Lang, limit = 100): Promise<SiteUpdate[]> {
  const titles = new Map<string, string>();
  for (const [dir, s] of Object.entries(sections)) {
    const name = lang === 'en' ? `${s.collection}En` : s.collection;
    const entries = await getCollection(name as any);
    for (const e of entries as { id: string; data: { title: string } }[]) {
      titles.set(`${dir}/${e.id}`, e.data.title);
    }
  }

  const updates: SiteUpdate[] = [];
  for (const c of changes) {
    const title = titles.get(`${c.section}/${c.id}`);
    if (!title) continue;
    const s = sections[c.section];
    updates.push({
      title,
      section: s.label[lang],
      href: `${lang === 'en' ? 'en/' : ''}${s.url}/${c.id}/`,
      subject: c.subject,
      date: c.date,
    });
    if (updates.length >= limit) break;
  }
  return updates;
}

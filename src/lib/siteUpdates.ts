import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { posix } from 'node:path';
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
  articoli: { collection: 'articoli', url: 'articoli', label: { it: 'Articoli', en: 'Articles' } },
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
  const titles = await pageTitles(lang);
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

/** Titoli delle pagine di contenuto, indicizzati per `sezione/id`. */
async function pageTitles(lang: Lang): Promise<Map<string, string>> {
  const titles = new Map<string, string>();
  for (const [dir, s] of Object.entries(sections)) {
    const name = lang === 'en' ? `${s.collection}En` : s.collection;
    const entries = await getCollection(name as any);
    for (const e of entries as { id: string; data: { title: string } }[]) {
      titles.set(`${dir}/${e.id}`, e.data.title);
    }
  }
  return titles;
}

const pageHref = (lang: Lang, section: SectionKey, id: string) =>
  `${lang === 'en' ? 'en/' : ''}${sections[section].url}/${id}/`;

const imageLoaders = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/**/*.{jpg,jpeg,png,webp}'
);
const imagePattern = /^src\/content\/([a-z-]+)\/([^/]+)\/.+\.(?:jpe?g|png|webp)$/i;

interface PhotoAddition {
  /** Percorso del file nella versione italiana, es. `src/content/luoghi/fonte-canale/photo1.jpg`. */
  file: string;
  section: SectionKey;
  /** Id della pagina nella cui cartella si trova la foto. */
  id: string;
  date: Date;
}

/**
 * Foto aggiunte alle cartelle di contenuto italiane, dalla più recente, ricavate dalla cronologia git.
 * Conta solo i file aggiunti (non modificati/rinominati) e salta i commit con [no-log].
 */
function readPhotoAdditions(): PhotoAddition[] {
  let out = '';
  try {
    out = execFileSync(
      'git',
      [
        '-c', 'core.quotepath=false',
        'log', '--name-only', '--diff-filter=A',
        `--format=${RECORD}%cI${FIELD}%B${FIELD}`,
        '--', 'src/content',
      ],
      { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }
    ).toString();
  } catch {
    return [];
  }

  const additions: PhotoAddition[] = [];
  const seen = new Set<string>();
  for (const record of out.split(RECORD).filter((r) => r.trim())) {
    const [iso, message, fileList] = record.split(FIELD);
    if (HIDDEN_MARKER.test(message)) continue;
    for (const file of (fileList ?? '').split('\n').map((f) => f.trim())) {
      const m = imagePattern.exec(file);
      if (!m || !(m[1] in sections) || !imageLoaders[`/${file}`] || seen.has(file)) continue;
      seen.add(file);
      additions.push({ file, section: m[1] as SectionKey, id: m[2], date: new Date(iso) });
    }
  }
  return additions;
}

const photoAdditions = readPhotoAdditions();

export interface LatestPhoto {
  title: string;
  href: string;
  image: ImageMetadata;
}

/** Massimo di foto mostrate per la stessa pagina, per non far dominare una sola pagina. */
const MAX_PHOTOS_PER_PAGE = 2;

/**
 * Ultime foto aggiunte alle pagine di contenuto, dalla più recente, ricavate dalla cronologia git.
 * Usa le foto della versione italiana.
 */
export async function getLatestPhotos(lang: Lang, limit = 5): Promise<LatestPhoto[]> {
  const titles = await pageTitles(lang);
  const photos: LatestPhoto[] = [];
  const perPage = new Map<string, number>();
  for (const a of photoAdditions) {
    const key = `${a.section}/${a.id}`;
    const title = titles.get(key);
    if (!title) continue;
    const count = perPage.get(key) ?? 0;
    if (count >= MAX_PHOTOS_PER_PAGE) continue;
    perPage.set(key, count + 1);
    photos.push({
      title,
      href: pageHref(lang, a.section, a.id),
      image: (await imageLoaders[`/${a.file}`]()).default,
    });
    if (photos.length >= limit) break;
  }
  return photos;
}

type Coords = { lat: number; lng: number };

interface PhotoRef {
  /** Pagina che mostra la foto, come `sezione/id`. */
  page: string;
  caption?: string;
  coords?: Coords;
}

const imageRefPattern = /\.{1,2}\/[^\s)"'\]]+?\.(?:jpe?g|png|webp)/gi;
const bodyImagePattern = /!\[([^\]]*)\]\((\.{1,2}\/[^)\s]+)\)/g;

function numberField(text: string, name: string): number | undefined {
  const m = new RegExp(`\\b${name}:\\s*(-?[\\d.]+)`).exec(text);
  return m ? Number(m[1]) : undefined;
}

function coordsIn(text: string): Coords | undefined {
  const lat = numberField(text, 'lat');
  const lng = numberField(text, 'lng');
  return lat !== undefined && lng !== undefined ? { lat, lng } : undefined;
}

function unquote(value: string): string {
  const t = value.trim();
  if (t.startsWith('"') && t.endsWith('"')) return t.slice(1, -1).replace(/\\"/g, '"');
  if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
  return t;
}

/**
 * Riferimenti alle foto nei file markdown di una lingua, indicizzati per percorso della foto
 * (riportato alla cartella italiana). Legge immagini, gallerie e foto geolocalizzate del
 * frontmatter e le immagini inserite nel testo, con le relative didascalie.
 * Restituisce anche le coordinate delle pagine che le dichiarano (`coordinate:` dei luoghi).
 */
function readPhotoRefs(lang: Lang) {
  const refs = new Map<string, PhotoRef[]>();
  const pageCoords = new Map<string, Coords>();
  const add = (file: string, ref: PhotoRef) => {
    const list = refs.get(file) ?? [];
    const existing = list.find((r) => r.page === ref.page);
    if (existing) {
      existing.caption ??= ref.caption;
      existing.coords ??= ref.coords;
    } else {
      list.push(ref);
    }
    refs.set(file, list);
  };

  for (const section of Object.keys(sections)) {
    const dir = `src/content/${section}${lang === 'en' ? '-en' : ''}`;
    let names: string[] = [];
    try {
      names = readdirSync(dir).filter((n) => n.endsWith('.md'));
    } catch {
      continue;
    }
    for (const name of names) {
      const page = `${section}/${name.slice(0, -3)}`;
      const text = readFileSync(`${dir}/${name}`, 'utf-8').replace(/\r\n/g, '\n');
      const resolve = (rel: string) =>
        posix.join(dir, rel).replace(/^src\/content\/([a-z-]+?)-en\//, 'src/content/$1/');

      const fm = /^---\n([\s\S]*?)\n---/.exec(text);
      if (fm) {
        // Divide il frontmatter in blocchi: chiavi di primo livello ed elementi di lista.
        const blocks: string[] = [];
        for (const line of fm[1].split('\n')) {
          if (blocks.length === 0 || /^\S/.test(line) || /^\s*- /.test(line)) blocks.push(line);
          else blocks[blocks.length - 1] += `\n${line}`;
        }
        for (const block of blocks) {
          if (/^coordinate:/.test(block)) {
            const c = coordsIn(block);
            if (c) pageCoords.set(page, c);
          }
          const caption = /didascalia:\s*(.+)/.exec(block)?.[1];
          const isListItem = /^\s*- /.test(block);
          for (const rel of block.match(imageRefPattern) ?? []) {
            add(resolve(rel), {
              page,
              caption: caption ? unquote(caption) : undefined,
              coords: isListItem ? coordsIn(block) : undefined,
            });
          }
        }
      }
      const body = fm ? text.slice(fm[0].length) : text;
      for (const m of body.matchAll(bodyImagePattern)) {
        add(resolve(m[2]), { page, caption: m[1].trim() || undefined });
      }
    }
  }
  return { refs, pageCoords };
}

export interface PhotoPage {
  title: string;
  section: string;
  href: string;
}

export interface PhotoEntry {
  image: ImageMetadata;
  caption?: string;
  date: Date;
  pages: PhotoPage[];
  /** `exact`: punto in cui è stata scattata la foto; `place`: posizione del luogo mostrato. */
  location?: Coords & { kind: 'exact' | 'place' };
}

/**
 * Cronologia delle foto inserite nel sito, dalla più recente, con le pagine che le mostrano,
 * la didascalia e, quando nota, la posizione.
 */
export async function getPhotoHistory(lang: Lang): Promise<PhotoEntry[]> {
  const titles = await pageTitles(lang);
  const { refs, pageCoords } = readPhotoRefs(lang);

  const entries: PhotoEntry[] = [];
  for (const a of photoAdditions) {
    const home = `${a.section}/${a.id}`;
    const photoRefs = (refs.get(a.file) ?? []).filter((r) => titles.has(r.page));
    if (photoRefs.length === 0 && titles.has(home)) photoRefs.push({ page: home });
    if (photoRefs.length === 0) continue;
    // La pagina nella cui cartella si trova la foto viene per prima.
    photoRefs.sort((x, y) => Number(y.page === home) - Number(x.page === home));

    const exact = photoRefs.find((r) => r.coords)?.coords;
    const place = photoRefs.map((r) => pageCoords.get(r.page)).find((c) => c !== undefined);
    entries.push({
      image: (await imageLoaders[`/${a.file}`]()).default,
      caption: photoRefs.find((r) => r.caption)?.caption,
      date: a.date,
      pages: photoRefs.map((r) => {
        const [section, id] = r.page.split('/') as [SectionKey, string];
        return {
          title: titles.get(r.page)!,
          section: sections[section].label[lang],
          href: pageHref(lang, section, id),
        };
      }),
      location: exact ? { ...exact, kind: 'exact' } : place ? { ...place, kind: 'place' } : undefined,
    });
  }
  return entries;
}

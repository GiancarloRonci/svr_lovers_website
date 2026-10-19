import { readFileSync } from 'node:fs';
import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { withBase } from './url';

type Lang = 'it' | 'en';

export interface MappaFotoPunto {
  lat: number;
  lng: number;
  src: string;
  full: string;
  didascalia?: string;
  name: string;
  link: string;
  linkLabel: string;
  immagine: ImageMetadata;
}

/**
 * Nomi dei file delle foto geolocalizzate di un percorso, nell'ordine del frontmatter, letti dal
 * file markdown: in build le immagini elaborate cambiano nome (hash, foto identiche unificate),
 * quindi non si possono riconoscere dal loro `src`.
 */
function fotoFileNames(filePath: string): string[] {
  const text = readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
  const block = /^foto:\n((?:[ \t].*\n?)*)/m.exec(text)?.[1] ?? '';
  return [...block.matchAll(/^\s+immagine:\s*["']?([^"'\n]+?)["']?\s*$/gm)].map((m) => m[1].split('/').pop()!);
}

/**
 * Risolve le foto di una Mappa Con Foto leggendo coordinate, immagine e didascalia dal percorso
 * da cui provengono (IT da `percorsi`, EN da `percorsiEn`). Una foto non trovata blocca la build.
 */
export async function resolveMappaFoto(
  foto: { percorso: string; immagine: string }[],
  lang: Lang
): Promise<MappaFotoPunto[]> {
  const percorsi = await getCollection(lang === 'en' ? 'percorsiEn' : 'percorsi');
  const byId = new Map(percorsi.map((p) => [p.id, p]));
  const prefix = lang === 'en' ? 'en/' : '';
  const fotoLabel = lang === 'en' ? 'Photo' : 'Foto';

  return Promise.all(
    foto.map(async ({ percorso, immagine }) => {
      const entry = byId.get(percorso);
      if (!entry) throw new Error(`Mappa Con Foto: percorso "${percorso}" non trovato (${lang})`);
      const index = fotoFileNames(entry.filePath!).indexOf(immagine);
      if (index < 0 || !entry.data.foto?.[index]) throw new Error(`Mappa Con Foto: foto "${immagine}" non trovata nel percorso "${percorso}" (${lang})`);
      const f = entry.data.foto![index];
      return {
        lat: f.lat,
        lng: f.lng,
        src: (await getImage({ src: f.immagine, width: 300 })).src,
        full: (await getImage({ src: f.immagine, width: 1400 })).src,
        didascalia: f.didascalia,
        name: `${entry.data.title} · ${fotoLabel} ${index + 1}`,
        link: withBase(`${prefix}percorsi/${percorso}/`),
        linkLabel: lang === 'en' ? 'Go to the trail' : 'Vai al percorso',
        immagine: f.immagine,
      };
    })
  );
}

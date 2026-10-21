import { readFileSync } from 'node:fs';
import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { withBase } from './url';
import { formatCredit } from './photoCredit';

type Lang = 'it' | 'en';

/** Voce dell'elenco `foto` di una Mappa Con Foto: foto di un percorso oppure foto propria. */
export type MappaFotoVoce =
  | { percorso: string; immagine: string }
  | { immagine: ImageMetadata; lat: number; lng: number; didascalia?: string; autore?: string; licenza?: string };

export interface MappaFotoPunto {
  lat: number;
  lng: number;
  src: string;
  full: string;
  didascalia?: string;
  credit: string;
  name: string;
  link?: string;
  linkLabel?: string;
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
 * Risolve le foto di una Mappa Con Foto. Per le foto dei percorsi coordinate, immagine e didascalia
 * si leggono dal percorso (IT da `percorsi`, EN da `percorsiEn`) e una foto non trovata blocca la
 * build; le foto proprie della mappa usano i dati scritti nell'elenco e prendono il nome della mappa.
 */
export async function resolveMappaFoto(foto: MappaFotoVoce[], lang: Lang, titoloMappa: string): Promise<MappaFotoPunto[]> {
  const percorsi = await getCollection(lang === 'en' ? 'percorsiEn' : 'percorsi');
  const byId = new Map(percorsi.map((p) => [p.id, p]));
  const prefix = lang === 'en' ? 'en/' : '';
  const fotoLabel = lang === 'en' ? 'Photo' : 'Foto';
  let proprie = 0;

  return Promise.all(
    foto.map(async (voce) => {
      if (!('percorso' in voce)) {
        proprie += 1;
        return {
          lat: voce.lat,
          lng: voce.lng,
          src: (await getImage({ src: voce.immagine, width: 300 })).src,
          full: (await getImage({ src: voce.immagine, width: 1400 })).src,
          didascalia: voce.didascalia,
          credit: formatCredit(voce.autore, voce.licenza),
          name: `${titoloMappa} · ${fotoLabel} ${proprie}`,
          immagine: voce.immagine,
        };
      }

      const { percorso, immagine } = voce;
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
        credit: formatCredit(f.autore, f.licenza),
        name: `${entry.data.title} · ${fotoLabel} ${index + 1}`,
        link: withBase(`${prefix}percorsi/${percorso}/`),
        linkLabel: lang === 'en' ? 'Go to the trail' : 'Vai al percorso',
        immagine: f.immagine,
      };
    })
  );
}

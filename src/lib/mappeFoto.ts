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
 * Nome del file senza cartella, estensione e hash: `foto3.jpg`, `/_astro/foto3.AbC123.jpg` e
 * `/@fs/.../foto3.jpg?origWidth=...` diventano tutti `foto3`.
 */
function baseName(path: string): string {
  return (path.split('?')[0].split('/').pop() ?? '').split('.')[0];
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
      const index = (entry.data.foto ?? []).findIndex((f) => baseName(f.immagine.src) === baseName(immagine));
      if (index < 0) throw new Error(`Mappa Con Foto: foto "${immagine}" non trovata nel percorso "${percorso}" (${lang})`);
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

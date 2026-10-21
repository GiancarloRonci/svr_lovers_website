import { getImage } from 'astro:assets';
import { formatCredit } from './photoCredit';

type GalleriaEntry = ImageMetadata | { immagine: ImageMetadata; didascalia?: string; autore?: string; licenza?: string };

export interface GalleryItem {
  immagine: ImageMetadata;
  full: string;
  alt: string;
  caption: string;
  credit: string;
}

export async function resolveGalleria(
  galleria: GalleriaEntry[] | undefined,
  title: string,
  offset = 0,
  photoLabel = 'foto'
): Promise<GalleryItem[]> {
  if (!galleria) return [];

  const normalized = galleria.map((entry) =>
    'immagine' in entry ? entry : { immagine: entry, didascalia: undefined, autore: undefined, licenza: undefined }
  );

  const full = await Promise.all(normalized.map((entry) => getImage({ src: entry.immagine, width: 1400 })));

  return normalized.map((entry, i) => ({
    immagine: entry.immagine,
    full: full[i].src,
    alt: entry.didascalia || `${title} - ${photoLabel} ${offset + i + 1}`,
    caption: entry.didascalia ?? '',
    credit: formatCredit(entry.autore, entry.licenza),
  }));
}

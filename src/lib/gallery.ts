import { getImage } from 'astro:assets';

type GalleriaEntry = ImageMetadata | { immagine: ImageMetadata; didascalia?: string };

export interface GalleryItem {
  immagine: ImageMetadata;
  full: string;
  alt: string;
  caption: string;
}

export async function resolveGalleria(
  galleria: GalleriaEntry[] | undefined,
  title: string,
  offset = 0,
  photoLabel = 'foto'
): Promise<GalleryItem[]> {
  if (!galleria) return [];

  const normalized = galleria.map((entry) =>
    'immagine' in entry ? entry : { immagine: entry, didascalia: undefined }
  );

  const full = await Promise.all(normalized.map((entry) => getImage({ src: entry.immagine, width: 1400 })));

  return normalized.map((entry, i) => ({
    immagine: entry.immagine,
    full: full[i].src,
    alt: entry.didascalia || `${title} - ${photoLabel} ${offset + i + 1}`,
    caption: entry.didascalia ?? '',
  }));
}

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const percorsiSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    tipo: z.enum(['urbano', 'naturalistico']),
    difficolta: z.enum(['facile', 'medio', 'difficile']),
    lunghezzaKm: z.number(),
    durata: z.string(),
    dislivello: z.string().optional(),
    immagine: image().optional(),
    gpx: z.string().optional(),
    partenza: z
      .object({ lat: z.number(), lng: z.number() })
      .optional(),
  });

const percorsi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/percorsi' }),
  schema: percorsiSchema,
});

const percorsiEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/percorsi-en' }),
  schema: percorsiSchema,
});

const storiaSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    data: z.coerce.date().optional(),
    immagine: image().optional(),
  });

const storia = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/storia' }),
  schema: storiaSchema,
});

const storiaEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/storia-en' }),
  schema: storiaSchema,
});

const luoghiSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    immagine: image().optional(),
    galleria: z.array(image()).optional(),
    coordinate: z.object({ lat: z.number(), lng: z.number() }).optional(),
  });

const luoghi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/luoghi' }),
  schema: luoghiSchema,
});

const luoghiEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/luoghi-en' }),
  schema: luoghiSchema,
});

const eventiSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    data: z.coerce.date(),
    immagine: image().optional(),
    galleria: z.array(image()).optional(),
  });

const eventi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/eventi' }),
  schema: eventiSchema,
});

const eventiEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/eventi-en' }),
  schema: eventiSchema,
});

const associazioneSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    categoria: z.enum(['scacchi', 'bocce', 'dama', 'proiezioni', 'altro']),
    description: z.string(),
    frequenza: z.string().optional(),
    immagine: image().optional(),
  });

const associazione = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/associazione' }),
  schema: associazioneSchema,
});

const associazioneEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/associazione-en' }),
  schema: associazioneSchema,
});

const newsSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    data: z.coerce.date(),
    immagine: image().optional(),
  });

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: newsSchema,
});

const newsEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news-en' }),
  schema: newsSchema,
});

export const collections = {
  percorsi,
  percorsiEn,
  storia,
  storiaEn,
  luoghi,
  luoghiEn,
  eventi,
  eventiEn,
  associazione,
  associazioneEn,
  news,
  newsEn,
};

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const percorsi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/percorsi' }),
  schema: ({ image }) =>
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
    }),
});

const storia = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/storia' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      data: z.coerce.date().optional(),
      immagine: image().optional(),
    }),
});

const luoghi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/luoghi' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      immagine: image().optional(),
      coordinate: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }),
});

const eventi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/eventi' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      data: z.coerce.date(),
      immagine: image().optional(),
      galleria: z.array(image()).optional(),
    }),
});

const associazione = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/associazione' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      categoria: z.enum(['scacchi', 'bocce', 'dama', 'proiezioni', 'altro']),
      description: z.string(),
      frequenza: z.string().optional(),
      immagine: image().optional(),
    }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      data: z.coerce.date(),
      immagine: image().optional(),
    }),
});

export const collections = { percorsi, storia, luoghi, eventi, associazione, news };

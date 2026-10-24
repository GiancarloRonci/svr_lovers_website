import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Autore e licenza di una foto; senza autore vale quello predefinito (src/lib/photoCredit.ts)
const creditoFoto = {
  autore: z.string().optional(),
  licenza: z.string().optional(),
};

const percorsiSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    tipo: z.enum(['urbano', 'naturalistico']),
    difficolta: z.enum(['facile', 'medio', 'difficile']),
    difficoltaNota: z.string().optional(),
    lunghezzaKm: z.number(),
    durata: z.string(),
    dislivello: z.string().optional(),
    immagine: image().optional(),
    immagineAutore: z.string().optional(),
    immagineLicenza: z.string().optional(),
    galleria: z
      .array(z.union([image(), z.object({ immagine: image(), didascalia: z.string().optional(), ...creditoFoto })]))
      .optional(),
    gpx: z.string().optional(),
    partenza: z
      .object({ lat: z.number(), lng: z.number() })
      .optional(),
    foto: z
      .array(
        z.object({
          lat: z.number(),
          lng: z.number(),
          immagine: image(),
          didascalia: z.string().optional(),
          ...creditoFoto,
        })
      )
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

// Mappa Con Foto: elenco esplicito di foto. Ogni voce è una foto presa da un percorso (slug del
// percorso + nome del file: coordinate, immagine e didascalia si leggono dal percorso, così restano
// sempre allineate) oppure una foto propria della mappa, con immagine, coordinate e didascalia.
const mappeFotoSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    foto: z.array(
      z.union([
        z.object({ percorso: z.string(), immagine: z.string() }),
        z.object({
          immagine: image(),
          lat: z.number(),
          lng: z.number(),
          didascalia: z.string().optional(),
          ...creditoFoto,
        }),
      ])
    ),
  });

const mappeFoto = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/mappe-foto' }),
  schema: mappeFotoSchema,
});

const mappeFotoEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/mappe-foto-en' }),
  schema: mappeFotoSchema,
});

const storiaSchema =({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
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

const leggendeSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    data: z.coerce.date().optional(),
    immagine: image().optional(),
  });

const leggende = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leggende' }),
  schema: leggendeSchema,
});

const leggendeEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leggende-en' }),
  schema: leggendeSchema,
});

const luoghiSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    comune: z.string(),
    minutiAuto: z.number().int().positive().optional(),
    immagine: image().optional(),
    immagineAutore: z.string().optional(),
    immagineLicenza: z.string().optional(),
    galleria: z
      .array(z.union([image(), z.object({ immagine: image(), didascalia: z.string().optional(), ...creditoFoto })]))
      .optional(),
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
    dataInizio: z.coerce.date(),
    dataFine: z.coerce.date().optional(),
    luogo: z.string().optional(),
    minutiAuto: z.number().int().positive().optional(),
    tipologiaEvento: z.string().optional(),
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
    categoria: z.enum(['scacchi', 'dama', 'bocce', 'proiezione-film', 'proiezione-partite', 'orientamento-turistico', 'percorsi-naturalistici', 'concorsi-fotografici', 'altro']),
    description: z.string(),
    frequenza: z.string().optional(),
    immagine: image().optional(),
    // ID del modulo Tally da incorporare nella pagina (es. "WOvL1P")
    moduloTally: z.string().optional(),
  });

const associazione =defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/associazione' }),
  schema: associazioneSchema,
});

const associazioneEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/associazione-en' }),
  schema: associazioneSchema,
});

// Regolamenti delle attività di Cultura&Turismo: stesso slug della scheda in `associazione`
const regolamentiSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const regolamenti = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/regolamenti' }),
  schema: regolamentiSchema,
});

const regolamentiEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/regolamenti-en' }),
  schema: regolamentiSchema,
});

const soggiornoSchema =({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    immagine: image().optional(),
    galleria: z
      .array(z.union([image(), z.object({ immagine: image(), didascalia: z.string().optional(), ...creditoFoto })]))
      .optional(),
    indirizzo: z.string().optional(),
    telefono: z.string().optional(),
    sito: z.string().optional(),
    coordinate: z.object({ lat: z.number(), lng: z.number() }).optional(),
  });

const soggiorno = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/soggiorno' }),
  schema: soggiornoSchema,
});

const soggiornoEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/soggiorno-en' }),
  schema: soggiornoSchema,
});

const cosaFareLinkSchema = z.object({ href: z.string(), testo: z.string() });

const cosaFareSchema = z.object({
  title: z.string(),
  description: z.string(),
  giorniTotali: z.number(),
  giorni: z.array(
    z.object({
      titolo: z.string().optional(),
      sintesi: z.string().optional(),
      tappe: z.array(
        z.object({
          oraInizio: z.string(),
          oraFine: z.string().optional(),
          attivita: z.string(),
          descrizione: z.string().optional(),
          link: z
            .union([cosaFareLinkSchema, z.array(cosaFareLinkSchema)])
            .optional(),
        })
      ),
    })
  ),
});

const cosaFare = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cosa-fare' }),
  schema: cosaFareSchema,
});

const cosaFareEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cosa-fare-en' }),
  schema: cosaFareSchema,
});

const articoliSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    data: z.coerce.date().optional(),
    autore: z.string().optional(),
    // Raggruppa l'articolo in una sezione di Cultura&Turismo ("Viaggi nel tempo", "Il weekend", "Storie in sanvitese")
    categoria: z.enum(['viaggi-nel-tempo', 'weekend', 'storie-in-sanvitese']).optional(),
    // Mostra l'immagine intera, senza ritaglio (es. locandine verticali)
    immagineIntera: z.boolean().optional(),
    // Limita l'altezza della copertina intera a circa tre quarti dello schermo (per le immagini verticali)
    copertinaBassa: z.boolean().optional(),
    immagine: image().optional(),
    // Parte dell'immagine da tenere nel ritaglio delle schede, con i valori di sharp: "top", "bottom", "left", "right", "left top", "left bottom", "right top", "right bottom" (non "center top"); senza, il centro
    copertinaPosizione: z.string().optional(),
    galleria: z
      .array(z.union([image(), z.object({ immagine: image(), didascalia: z.string().optional(), ...creditoFoto })]))
      .optional(),
  });

const articoli = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articoli' }),
  schema: articoliSchema,
});

const articoliEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articoli-en' }),
  schema: articoliSchema,
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
  mappeFoto,
  mappeFotoEn,
  storia,
  storiaEn,
  leggende,
  leggendeEn,
  luoghi,
  luoghiEn,
  eventi,
  eventiEn,
  associazione,
  associazioneEn,
  regolamenti,
  regolamentiEn,
  news,
  newsEn,
  soggiorno,
  soggiornoEn,
  cosaFare,
  cosaFareEn,
  articoli,
  articoliEn,
};

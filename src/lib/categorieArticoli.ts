// Le categorie degli articoli: ogni articolo ne ha una (campo `categoria`) e ogni categoria
// ha la sua pagina in /articoli/categoria/<id>/ (e /en/articoli/categoria/<id>/).
// L'ordine dell'elenco è quello in cui compaiono nella pagina degli articoli.

export const CATEGORIE_ARTICOLI = [
  {
    id: 'viaggi-nel-tempo',
    it: {
      nome: 'Viaggi nel tempo',
      descrizione:
        "Articoli che ci riportano nella San Vito di una volta: un'immagine del passato ricreata con l'intelligenza artificiale e un testo che la racconta.",
    },
    en: {
      nome: 'Journeys Through Time',
      descrizione:
        'Articles that take us back to the San Vito of the past: an image of bygone days recreated with artificial intelligence and a text that tells its story.',
    },
  },
  {
    id: 'storie-in-sanvitese',
    it: {
      nome: 'Storie in sanvitese',
      descrizione:
        "Storie e poesie nel dialetto di San Vito Romano, ciascuna con un'immagine e una spiegazione in italiano.",
    },
    en: {
      nome: 'Stories in Sanvitese',
      descrizione:
        'Stories and poems in the dialect of San Vito Romano, each with an image and an explanation in English.',
    },
  },
  {
    id: 'personaggi',
    it: {
      nome: 'Personaggi',
      descrizione: 'Le persone che hanno lasciato il segno a San Vito Romano, raccontate con i ricordi della community.',
    },
    en: {
      nome: 'People',
      descrizione: 'The people who left their mark on San Vito Romano, told through the memories of the community.',
    },
  },
  {
    id: 'com-era-san-vito',
    it: {
      nome: "Com'era San Vito",
      descrizione: 'Il paese di una volta e di oggi: luoghi scomparsi, vecchie foto e ritratti di San Vito Romano.',
    },
    en: {
      nome: 'San Vito As It Was',
      descrizione: 'The town of yesterday and today: places that are gone, old photos and portraits of San Vito Romano.',
    },
  },
  {
    id: 'weekend',
    it: {
      nome: 'Il weekend',
      descrizione:
        'I nostri consigli per il fine settimana: sagre, escursioni, concerti e appuntamenti a San Vito Romano e nei dintorni, scelti tra gli eventi in programma.',
    },
    en: {
      nome: 'The Weekend',
      descrizione:
        'Our tips for the weekend: food festivals, hikes, concerts and events in San Vito Romano and the surrounding area, picked from the events on the calendar.',
    },
  },
  {
    id: 'community',
    it: {
      nome: 'La community',
      descrizione: 'Le novità di SanVitoRomano Lovers: il sito, i contest e le iniziative della community.',
    },
    en: {
      nome: 'The Community',
      descrizione: 'News from SanVitoRomano Lovers: the website, the contests and the community’s initiatives.',
    },
  },
] as const;

export type CategoriaArticolo = (typeof CATEGORIE_ARTICOLI)[number]['id'];

export const ID_CATEGORIE_ARTICOLI = CATEGORIE_ARTICOLI.map((c) => c.id) as [CategoriaArticolo, ...CategoriaArticolo[]];

export function categoriaArticolo(id: CategoriaArticolo) {
  return CATEGORIE_ARTICOLI.find((c) => c.id === id)!;
}

// Membri di SanVitoRomano Lovers mostrati nella pagina "Chi siamo", in ordine di ingresso.
// Compaiono solo i membri che hanno dato il consenso a essere citati.
// Per aggiungere la foto: salvare l'immagine in src/assets/membri/ e importarla qui
// (es. `import fotoGiancarlo from '../assets/membri/giancarlo-ronci.jpg';` e poi `foto: fotoGiancarlo`).
// Per il motto: compilare `motto` in italiano e in inglese.
import type { ImageMetadata } from 'astro';

export interface Membro {
  nome: string;
  foto?: ImageMetadata;
  motto?: { it: string; en: string };
}

export const membri: Membro[] = [
  { nome: 'Giancarlo Ronci' },
  { nome: 'Marco Maccaroni' },
  { nome: 'Angelo Rossi' },
  { nome: 'Enrico Padella' },
  { nome: 'Antonio Orlandi' },
  { nome: 'Vito Rossi' },
];

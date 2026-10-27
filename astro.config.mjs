// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { didascalieImmagini } from './src/lib/didascalie-immagini.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.sanvitoromanolovers.org',
  base: '/',
  markdown: {
    // Didascalie sotto le immagini degli articoli, dal testo alternativo
    processor: satteri({ hastPlugins: [didascalieImmagini] }),
  },
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
  },
  // Vecchi indirizzi della sezione Cultura&Turismo (ex Circolo Culturale)
  redirects: {
    '/associazione': '/culturaturismo',
    '/associazione/[id]': '/culturaturismo/[id]',
    '/en/associazione': '/en/culturaturismo',
    '/en/associazione/[id]': '/en/culturaturismo/[id]',
    // Vecchio indirizzo della scheda generica "Concorsi fotografici"
    '/culturaturismo/concorsi-fotografici': '/culturaturismo/contest-fotografico-il-sole-ridisegna-i-contorni',
    '/en/culturaturismo/concorsi-fotografici': '/en/culturaturismo/contest-fotografico-il-sole-ridisegna-i-contorni',
  },
});

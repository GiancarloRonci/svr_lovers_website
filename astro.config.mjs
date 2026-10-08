// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.sanvitoromanolovers.org',
  base: '/',
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

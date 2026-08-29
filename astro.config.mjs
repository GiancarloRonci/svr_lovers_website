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
});

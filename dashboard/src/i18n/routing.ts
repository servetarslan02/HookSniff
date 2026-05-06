import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'tr', 'de', 'ja', 'pt-BR', 'es', 'fr', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

import adminMessages from '@whilesmart/eloquent-admin-ui/messages/en.json';

export default defineI18nConfig(() => ({
  legacy: false,
  messages: { en: adminMessages },
  // English is the source language: a key missing from another locale renders its English
  // text instead of the key, and without a console warning for every string.
  fallbackLocale: 'en'
}));

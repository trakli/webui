import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: true,
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'de', name: 'Deutsch', file: 'de.json' },
      { code: 'pt', name: 'Português', file: 'pt.json' },
      { code: 'it', name: 'Italiano', file: 'it.json' }
    ],
    defaultLocale: 'en',
    lazy: true,
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      fallbackLocale: 'en'
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://api.dev.trakli.app/api/v1'
    }
  },
  app: {
    head: {
      title: 'Trakli',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Trakli - Simplify your finances' }
      ]
    }
  },
  css: [
    '@/assets/scss/_variables.scss',
    '@/assets/scss/base.scss',
    '@/assets/scss/_form-styles.scss',
    '@/assets/scss/_transaction-form.scss'
  ],
  build: {
    transpile: []
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'https://api.dev.trakli.app/api/v1',
        changeOrigin: true,
        prependPath: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
});

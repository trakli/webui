import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: true,
  modules: ['@nuxtjs/i18n'],
  i18n: {
    restructureDir: false,
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'fr', file: 'fr.json' },
      { code: 'de', file: 'de.json' },
      { code: 'es', file: 'es.json' }
    ],
    defaultLocale: 'en',
    langDir: 'locales'
  },
  runtimeConfig: {
    public: {
      apiBase:
        process.env.NODE_ENV === 'production'
          ? process.env.NUXT_PUBLIC_API_BASE_URL || 'https://api.dev.trakli.app/api/v1'
          : '/api'
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

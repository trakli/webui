import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: true,
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
  css: ['@/assets/scss/_variables.scss', '@/assets/scss/base.scss'],
  build: {
    transpile: []
  }
});

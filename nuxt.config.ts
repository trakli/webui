import { defineNuxtConfig } from 'nuxt/config';
import Icons from 'unplugin-icons/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    plugins: [Icons({ compiler: 'vue3', autoInstall: false })]
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: true,
  // A layer registers a component against a slot key with
  // useExtensionSlots().registerComponent(), and DescriptorRenderer resolves it when a
  // descriptor sets `ui.component`. That is how plugin UI reaches the app.
  extends: ['@whilesmart/eloquent-admin-ui'],
  routeRules: {
    '/ai-insights': { redirect: '/assistant' }
  },
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
    vueI18n: './i18n/i18n.config.ts',
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
      adminApiPrefix: '/admin',
      adminI18n: true,
      adminNavigation: [
        {
          label: 'Outreach',
          to: '/admin/outreach',
          icon: 'solar:plain-3-bold-duotone',
          area: 'slate'
        }
      ],
      adminUserColumns: [
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Last seen', key: 'last_seen_at', type: 'datetime' },
        { label: 'Last transaction', key: 'last_transaction_at', type: 'datetime' },
        { label: 'Joined', key: 'created_at', type: 'date' },
        { label: 'AI tokens', key: 'tokens_used', type: 'number' }
      ],
      adminMetricDrilldowns: {
        new_users_series: '/admin/users?joined_on={date}'
      },
      adminBrand: {
        name: 'Trakli',
        logoSrc: '/logo.svg',
        logoMarkSrc: '/logo-mark.svg',
        tag: 'Admin',
        tagArea: 'green'
      },
      adminSkin: {
        name: 'trakli',
        railClass: '',
        contentClass: ''
      },
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://api.dev.trakli.app/api/v1',
      engagementSiteKey: process.env.NUXT_PUBLIC_ENGAGEMENT_SITE_KEY || '',
      reverbKey: process.env.NUXT_PUBLIC_REVERB_KEY || '',
      reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || 'localhost',
      reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT || '6001',
      reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || 'http'
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
    // After the design layer's own stylesheet: it redeclares the tokens Trakli owns.
    '@/assets/css/design-brand.css',
    '@/assets/scss/_variables.scss',
    '@/assets/scss/base.scss',
    '@/assets/scss/_surfaces.scss',
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

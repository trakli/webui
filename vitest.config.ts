import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import { resolve } from 'path';

const pluginLayers = (process.env.TRAKLI_UI_LAYERS || '')
  .split(',')
  .map((layer) => layer.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [Icons({ compiler: 'vue3', autoInstall: false }), vue()],
  server: {
    fs: { allow: [resolve(__dirname), ...pluginLayers.map((layer) => resolve(__dirname, layer))] }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      ...pluginLayers.map((layer) => `${layer}/tests/**/*.{test,spec}.{js,ts}`)
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['components/**/*.vue', 'composables/**/*.ts', 'services/**/*.ts']
    }
  },
  resolve: {
    dedupe: ['vue', '@vue/test-utils', 'vitest', '@whilesmart/design'],
    alias: {
      '@': resolve(__dirname, './'),
      '~': resolve(__dirname, './')
    }
  }
});

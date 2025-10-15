import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt({
  features: {
    typescript: true,
    vue: true,
    stylistic: false
  }
}).append({
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/html-self-closing': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
});

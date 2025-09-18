module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-prettier',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['vue', 'prettier'],
  globals: {
    useCookie: 'readonly',
    useRoute: 'readonly',
    useRouter: 'readonly',
    useHead: 'readonly',
    useState: 'readonly',
    useFetch: 'readonly',
    $fetch: 'readonly',
    navigateTo: 'readonly',
    definePageMeta: 'readonly',
    response: 'readonly'
  },
  rules: {
    'prettier/prettier': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'no-unused-vars': 'warn'
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    {
      files: ['*.js', '*.mjs', '*.cjs'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  ]
};

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(
  process.env.PAGEBEAM_CLI || new URL('../package.json', import.meta.url)
);
const { parse } = require('yaml');
const required = (name) => {
  if (!process.env[name]) throw new Error(`Set ${name}`);
  return process.env[name];
};
const backend = resolve(required('PAGEBEAM_BACKEND_PATH'));
const backendRevision = required('PAGEBEAM_BACKEND_REVISION');
const config = parse(await readFile('pagebeam.config.yaml', 'utf8'));
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
const seed = quote(fileURLToPath(new URL('seed-account.mjs', import.meta.url)));
config.tours.timeoutMs = 120000;
for (const [name, account] of Object.entries(config.tours.accounts)) {
  account.seed = {
    command: `node ${seed} ${name === 'newcomer' ? 'onboarding' : 'active-month'}`,
    targets: ['after', 'before']
  };
}
const mapping = {
  onboarding: ['pages/onboarding.vue', 'pages/onboarding/**', 'components/onboarding/**'],
  'log-a-coffee': [
    'pages/transactions/**',
    'components/Transaction*.vue',
    'services/transactionApi.ts',
    'composables/useTransactions.ts'
  ],
  'month-overview': ['pages/dashboard/**', 'components/dashboard/**'],
  wallets: [
    'pages/wallets.vue',
    'components/wallets/**',
    'components/Wallet*.vue',
    'services/api/walletsApi.ts'
  ]
};
for (const [name, journey] of Object.entries(config.tours.journeys)) {
  journey.paths = mapping[name] || [];
  journey.steps = journey.steps.filter((step) => typeof step.wait !== 'number');
}
config.tours.journeys['log-a-coffee'].steps.splice(-1, 0, {
  expect: { selector: '.custom-table:visible tbody tr, .txn-card:visible', text: 'Oat flat white' }
});
const environments = {};
for (const [name, port] of [
  ['after', 4300],
  ['before', 4301]
]) {
  const frontend = resolve(required(`PAGEBEAM_${name.toUpperCase()}_PATH`));
  const revision = required(`PAGEBEAM_${name.toUpperCase()}_REVISION`);
  const url = `http://127.0.0.1:${port}`;
  config.tours.targets[name] = { url };
  environments[name] = {
    backend: {
      kind: 'directory',
      path: backend,
      start: 'php artisan serve --host=127.0.0.1 --port=8100',
      ready: 'http://127.0.0.1:8100/',
      revision: backendRevision
    },
    frontend: {
      path: frontend,
      start: `npm run dev -- --host 127.0.0.1 --port ${port}`,
      ready: url
    },
    frontendRevision: revision,
    env: { NUXT_PUBLIC_API_BASE: 'http://127.0.0.1:8100/api/v1', PAGEBEAM_BACKEND_PATH: backend },
    requiredEnv: [],
    disposable: true,
    timeoutMs: 180000,
    fixtures: { version: `trakli-demo-${backendRevision}` }
  };
}
config.capture = {
  environments,
  groups: {
    shared: {
      paths: [
        'layouts/**',
        'assets/**',
        'nuxt.config.ts',
        'plugins/**',
        'components/base/**',
        'components/TNavbar.vue',
        'composables/**',
        'services/**',
        'package.json',
        'package-lock.json',
        'pagebeam.config.yaml',
        '.pagebeam/**',
        '.github/workflows/pagebeam-capture.yml'
      ],
      journeys: Object.keys(config.tours.journeys)
    }
  },
  mask: ['img.avatar-image']
};
await mkdir('.pagebeam', { recursive: true });
await writeFile('.pagebeam/capture.json', JSON.stringify(config, null, 2));

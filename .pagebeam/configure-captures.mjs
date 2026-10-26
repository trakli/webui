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
config.tours.timeoutMs = 20000;
for (const [name, account] of Object.entries(config.tours.accounts)) {
  account.seed = {
    command: `node ${seed} ${name === 'newcomer' ? 'onboarding' : 'active-month'}`,
    targets: ['ci']
  };
}
const shotRoutes = {
  language: '/onboarding',
  wallet: '/onboarding',
  categories: '/onboarding',
  'coffee-form': '/transactions/new',
  'coffee-recorded': '/transactions',
  totals: '/dashboard',
  spending: '/dashboard',
  recent: '/dashboard',
  wallets: '/wallets',
  'dollar-savings': '/wallets'
};
for (const journey of Object.values(config.tours.journeys)) {
  journey.steps = journey.steps.filter((step) => typeof step.wait !== 'number');
  for (const step of journey.steps) {
    if (step.shot && shotRoutes[step.shot.name]) step.shot.route = shotRoutes[step.shot.name];
  }
}
config.tours.journeys['log-a-coffee'].steps.splice(-1, 0, {
  expect: {
    selector:
      '.custom-table:visible tbody tr:has-text("Corner Coffee"):has-text("just now"), .txn-card:visible:has-text("Oat flat white")',
    text: '4.2'
  }
});
const dashboard = config.tours.journeys['month-overview'];
dashboard.steps = dashboard.steps.filter((step) => !step.shot);
dashboard.steps.push(
  { wait: '.category-breakdown' },
  { wait: '.recent-transactions' },
  { shot: { name: 'dashboard', route: '/dashboard', fullPage: true } }
);
config.tours.targets.ci = { url: 'http://127.0.0.1:4300' };
const environment = {
  backend: {
    kind: 'directory',
    path: backend,
    start: 'php artisan serve --host=127.0.0.1 --port=8100',
    ready: 'http://127.0.0.1:8100/',
    revision: backendRevision
  },
  frontend: {
    path: '.',
    start: 'npm run dev -- --host 127.0.0.1 --port 4300',
    ready: 'http://127.0.0.1:4300'
  },
  env: { NUXT_PUBLIC_API_BASE: 'http://127.0.0.1:8100/api/v1', PAGEBEAM_BACKEND_PATH: backend },
  disposable: true,
  timeoutMs: 180000,
  fixtures: { version: `trakli-demo-${backendRevision}` }
};
config.capture = {
  environments: { ci: environment },
  impact: { ignore: ['.gitignore'] },
  mask: ['img.avatar-image']
};
await mkdir('.pagebeam', { recursive: true });
await writeFile('.pagebeam/capture.json', JSON.stringify(config, null, 2));

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scenario = process.argv[2];
if (!['onboarding', 'active-month'].includes(scenario)) {
  throw new Error('Expected onboarding or active-month.');
}

const command =
  process.env.TRAKLI_DEMO_COMMAND || 'docker compose exec -T --user www-data app php artisan demo';
const result = spawnSync('sh', ['-c', `${command} "$@"`, 'screenshot-account', scenario], {
  cwd: fileURLToPath(new URL('../../webservice', import.meta.url)),
  encoding: 'utf8',
  env: process.env
});
if (result.error) throw result.error;
if (result.status !== 0) {
  process.stderr.write(result.stderr || 'Could not create the screenshot account.\n');
  process.exit(result.status || 1);
}
process.stdout.write(result.stdout);

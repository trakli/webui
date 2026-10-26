import { spawnSync } from 'node:child_process';

const scenario = process.argv[2];
if (!['onboarding', 'active-month'].includes(scenario)) throw new Error('Unknown demo scenario');
if (!process.env.PAGEBEAM_BACKEND_PATH) throw new Error('Set PAGEBEAM_BACKEND_PATH');
const result = spawnSync('php', ['artisan', 'demo', scenario], {
  cwd: process.env.PAGEBEAM_BACKEND_PATH,
  encoding: 'utf8',
  env: process.env
});
if (result.error) throw result.error;
if (result.status !== 0) {
  process.stderr.write(result.stderr || 'Could not create the screenshot account.\n');
  process.exit(result.status || 1);
}
process.stdout.write(result.stdout);

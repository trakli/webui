import { readdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import * as prettier from 'prettier';

const host = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const layers = (process.env.TRAKLI_UI_LAYERS || '')
  .split(',')
  .map((layer) => layer.trim())
  .filter(Boolean)
  .map((layer) => resolve(host, layer));
const extensions = new Set(['.ts', '.js', '.mjs', '.vue', '.json', '.md']);
const excluded = new Set(['node_modules', '.nuxt', '.output', '.git']);

async function sources(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sources(path)));
    else if (extensions.has(extname(path))) files.push(path);
  }
  return files;
}

if (layers.length) {
  let common = host;
  for (const layer of layers) {
    while (relative(common, layer).startsWith('..')) common = dirname(common);
  }
  const eslint = new ESLint({ cwd: common, overrideConfigFile: join(host, 'eslint.config.mjs') });
  const results = await eslint.lintFiles(layers.map((layer) => `${layer}/**/*.{ts,js,mjs,vue}`));
  console.log(await (await eslint.loadFormatter('stylish')).format(results));
  if (results.some((result) => result.errorCount)) process.exitCode = 1;

  const options = await prettier.resolveConfig(join(host, 'nuxt.config.ts'));
  for (const layer of layers) {
    for (const file of await sources(layer)) {
      if (!(await prettier.check(await readFile(file, 'utf8'), { ...options, filepath: file }))) {
        console.error(`Formatting failed: ${relative(host, file)}`);
        process.exitCode = 1;
      }
    }
  }
  if (!process.exitCode) console.log('Plugin layer lint and formatting passed.');
} else {
  console.log('No plugin layers configured.');
}

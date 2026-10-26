import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const [resultFile, output] = process.argv.slice(2);
if (!resultFile || !output) throw new Error('Expected capture result and output directory');
const root = resolve(output);
await mkdir(root, { recursive: true });
const html = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
  );
const inside = (directory, file = '') => {
  const path = relative(root, resolve(directory, file));
  if (path === '..' || path.startsWith(`..${sep}`) || path.startsWith(sep))
    throw new Error('Capture outside artifact directory');
  return path.split(sep).map(encodeURIComponent).join('/');
};
let result;
try {
  result = JSON.parse(await readFile(resultFile, 'utf8'));
} catch {
  result = null;
}
let content =
  '<p>No completed comparison was produced. Inspect the capture reports and workflow logs.</p>';
if (result?.comparison) {
  const comparison = result.comparison;
  const report = comparison.report;
  content = `<p>Before: <code>${html(report.base.revision)}</code><br>After: <code>${html(report.head.revision)}</code></p>`;
  content += report.compatible
    ? '<p>Both revisions completed the same saved journeys and viewports.</p>'
    : `<p>Incomplete comparison: ${report.reasons.map(html).join('; ')}.</p>`;
  for (const shot of report.captures) {
    const image = (directory, file, label) =>
      file
        ? `<a href="${inside(directory, file)}"><img alt="${label}" src="${inside(directory, file)}" loading="lazy"></a>`
        : '<p>Screenshot unavailable</p>';
    content += `<section><h2>${html(shot.journey)} / ${html(shot.viewport)} / step ${html(shot.step)}</h2><div class="pair"><figure><figcaption>Before</figcaption>${image(comparison.directory, shot.base, 'Before')}</figure><figure><figcaption>After</figcaption>${image(result.directory, shot.head, 'After')}</figure></div></section>`;
  }
} else if (result?.report.status === 'empty') {
  content = `<p>No saved journey matches these changes.</p><p>Unmapped paths: ${result.report.selection.unmapped.map(html).join(', ')}</p>`;
}
const runs = [];
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  try {
    const directory = resolve(root, entry.name);
    const report = JSON.parse(await readFile(resolve(directory, 'report.json'), 'utf8'));
    runs.push(
      `<li><a href="${inside(directory, 'index.html')}">${html(report.environment)}: ${html(report.status)}</a></li>`
    );
  } catch {
    // A run can stop before its first report is saved.
  }
}
await writeFile(
  resolve(root, 'index.html'),
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Trakli PR screenshots</title><style>body{font:16px system-ui;margin:2rem;padding:0 1rem}h2{margin-top:3rem}.pair{display:grid;grid-template-columns:1fr 1fr;gap:1rem}figure{margin:0;min-width:0}img{max-width:100%;border:1px solid #aaa}figcaption{font-weight:bold;margin-bottom:1rem}code{overflow-wrap:anywhere}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>Trakli before and after</h1>${content}<h2>Capture reports</h2><ul>${runs.join('')}</ul></html>`
);

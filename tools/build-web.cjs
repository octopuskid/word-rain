// Rebuild the self-contained HTML. No gameplay code or storage keys are rewritten.
const fs = require('node:fs');
const path = require('node:path');
const { minify } = require('html-minifier-terser');
const root = path.resolve(__dirname, '..');
(async () => {
  const source = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
  const html = (await minify(source, require('./minify-options.cjs')())).trimEnd();
  const version = source.match(/v(\d+\.\d+\.\d+(?:\.\d+)?(?:-[0-9A-Za-z.-]+)?)(?: DEV)? · NO UMBRELLA/)[1];
  fs.mkdirSync(path.join(root, 'versions'), { recursive: true });
  for (const name of ['index.html', `versions/word-rain-${version}.html`])
    fs.writeFileSync(path.join(root, name), html + '\n');
  await require('./build-test.cjs')();
  console.log(`HTML: ${Buffer.byteLength(source)} → ${Buffer.byteLength(html + '\n')} bytes`);
})().catch(error => { console.error(error); process.exitCode = 1; });

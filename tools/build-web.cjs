// Rebuild the self-contained HTML. No gameplay code or storage keys are rewritten.
const fs = require('node:fs');
const path = require('node:path');
const { minify } = require('html-minifier-terser');
const root = path.resolve(__dirname, '..');
(async () => {
  const source = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
  const html = await minify(source, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    minifyCSS: { level: 1 },
    minifyJS: {
      // Keep globals/function names for the regression harness and native bridge.
      compress: { passes: 2, unsafe: false, toplevel: false },
      mangle: { toplevel: false, keep_fnames: true },
      keep_fnames: true,
      format: { comments: false, ascii_only: false, inline_script: true }
    }
  });
  for (const name of ['index.html', 'word-rain-1.6.3.1.html'])
    fs.writeFileSync(path.join(root, name), html + '\n');
  console.log(`HTML: ${Buffer.byteLength(source)} → ${Buffer.byteLength(html + '\n')} bytes`);
})().catch(error => { console.error(error); process.exitCode = 1; });

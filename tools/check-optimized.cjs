const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const scripts = text => [...text.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
for(const script of scripts(read('index.html')))new (require('node:vm').Script)(script);
const delivered = read('index.html');
assert.equal(delivered, read('word-rain-' + read('src/index.html').match(/v(\d+\.\d+\.\d+(?:\.\d+)?)(?: DEV)? · NO UMBRELLA/)[1] + '.html'));
assert(Buffer.byteLength(delivered) < Buffer.byteLength(read('word-rain-1.6.3.html')));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'word-rain-web-'));
try {
  const fixture = path.join(temp, 'mobile.html');
  execFileSync('python', ['-c',
    'from pathlib import Path; from android.mobile import mobile_html; import sys; Path(sys.argv[1]).write_text(mobile_html(Path("index.html").read_text()))', fixture], { cwd: root });
  // Historical suites assert the earlier fixed score amounts. Use the new
  // scoring matrix plus the unchanged target/spawn suites for this dev build.
  for (const test of ['scoring-1641', 'arena-word', 'uniform-spawning']) {
    process.stdout.write(execFileSync(process.execPath,
      [path.join(root, 'android/tests', test + '.cjs'), fixture], { cwd: root }));
  }
  console.log(`PASS optimized HTML: ${Buffer.byteLength(delivered)} bytes; current scoring regression checks passed.`);
} finally { fs.rmSync(temp, { recursive: true, force: true }); }

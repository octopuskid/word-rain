const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const scripts = text => [...text.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert.deepEqual(scripts(read('src/index.html')), scripts(read('word-rain-1.6.3.html')),
  'Readable gameplay scripts must match the stable release exactly');
const delivered = read('index.html');
assert.equal(delivered, read('word-rain-' + read('src/index.html').match(/v(\d+\.\d+\.\d+\.\d+) DEV/)[1] + '.html'));
assert(Buffer.byteLength(delivered) < Buffer.byteLength(read('word-rain-1.6.3.html')));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'word-rain-web-'));
try {
  const fixture = path.join(temp, 'mobile.html');
  execFileSync('python', ['-c',
    'from pathlib import Path; from android.mobile import mobile_html; import sys; Path(sys.argv[1]).write_text(mobile_html(Path("index.html").read_text()))', fixture], { cwd: root });
  for (const test of ['mobile-records', 'overlap-150', 'shield-progress-151',
    'wrong-sound-152', 'catch-progress-153', 'overcast-160', 'arena-word',
    'uniform-spawning', 'rick-143']) {
    process.stdout.write(execFileSync(process.execPath,
      [path.join(root, 'android/tests', test + '.cjs'), fixture], { cwd: root }));
  }
  console.log(`PASS optimized HTML: ${Buffer.byteLength(delivered)} bytes; stable gameplay source unchanged.`);
} finally { fs.rmSync(temp, { recursive: true, force: true }); }

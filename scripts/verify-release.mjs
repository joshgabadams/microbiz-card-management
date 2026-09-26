import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const output = mkdtempSync(join(tmpdir(), 'microbiz-release-'));
const vite = join(process.cwd(), 'node_modules/vite/bin/vite.js');
function build(name, settings, expectedError) {
  const destination = join(output, name);
  const result = spawnSync(process.execPath, [vite, 'build', '--outDir', destination], {
    cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, ...settings },
  });
  if (expectedError) {
    assert.notEqual(result.status, 0, `${name} must reject invalid settings`);
    assert.match(result.stderr, expectedError);
    return;
  }
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert(!existsSync(join(destination, 'references')), 'design references must not be published');
  const assets = readdirSync(join(destination, 'assets'));
  assert(!assets.some(file => file.endsWith('.map')), 'do not ship source maps');
  const loader = assets.find(file => /^loading-animation-.+\.png$/.test(file));
  assert(loader, 'fingerprinted loading asset must be present');
  const css = assets.filter(file => file.endsWith('.css')).map(file => readFileSync(join(destination, 'assets', file), 'utf8')).join('');
  assert(css.includes(loader), 'CSS must reference the emitted loader');
  const js = assets.filter(file => file.endsWith('.js')).map(file => readFileSync(join(destination, 'assets', file), 'utf8')).join('');
  const fixture = 'CUS-10021';
  assert.equal(js.includes(fixture), name === 'demo', 'fixture isolation follows selected mode');
  for (const file of assets) assert(!/reference|card-layout/i.test(file) || name === 'demo' && file.startsWith('inventoryReference'), `unexpected asset ${file}`);
  console.log(`PASS ${name}: build, loading asset, reference exclusion and fixture isolation.`);
}
build('api', { VITE_DATA_MODE: 'api', VITE_API_BASE_URL: '/api' });
build('demo', { VITE_DATA_MODE: 'demo', VITE_API_BASE_URL: '' });
build('invalid-mode', { VITE_DATA_MODE: 'invalid', VITE_API_BASE_URL: '' }, /VITE_DATA_MODE must be demo or api/);
build('invalid-url', { VITE_DATA_MODE: 'api', VITE_API_BASE_URL: 'http://insecure.example/api' }, /Use an HTTPS API URL/);
console.log(`PASS invalid configuration rejected before building. Reviewable build artifacts: ${output}`);

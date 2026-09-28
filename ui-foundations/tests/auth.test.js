import test from 'node:test';
import assert from 'node:assert/strict';
import { readEnvironment } from '../src/config/environment.js';
import { ApiError, normalizeError, retryQuery } from '../src/api/errors.js';
import { createHttpClient } from '../src/api/http.js';
import { createService } from '../src/api/service.js';
import { hasPermission, normalizeSession } from '../src/services/session.js';
import { routePermission } from '../src/config/permissions.js';

function session(permissions = ['cards.read']) {
  let value = normalizeSession({ user: { id: 'operator', name: 'Operator' }, permissions });
  let revision = 0;
  return { get: () => value, revision: () => revision, set(next) { value = next; revision += 1; } };
}

test('environment defaults to closed API builds and explicit demo development', () => {
  assert.equal(readEnvironment().mode, 'api');
  assert.equal(readEnvironment({ DEV: true }).mode, 'demo');
  assert.equal(readEnvironment({ VITE_DATA_MODE: 'demo' }).mode, 'demo');
  for (const base of ['http://example.test', '//evil.test', '/api?token=secret', 'https://user:secret@example.test', '/\\evil.test']) assert.throws(() => readEnvironment({ VITE_API_BASE_URL: base }));
  for (const base of ['/api', 'https://bank.example/api']) assert.equal(readEnvironment({ VITE_API_BASE_URL: base }).baseURL, base);
  assert.throws(() => readEnvironment({ VITE_DATA_MODE: 'typo' }));
});

test('error normalization discards payloads, credentials, server messages and Axios metadata', () => {
  const raw = { message: 'secret', config: { headers: { Authorization: 'secret' } }, response: { status: 403, data: { message: 'secret', pan: '1234567890123456' } } };
  const error = normalizeError(raw);
  assert(error instanceof Error);
  assert.equal(error.code, 'FORBIDDEN');
  assert.equal(error.config, undefined);
  assert.equal(error.response, undefined);
  assert.equal(error.details, undefined);
  assert(!JSON.stringify(error).includes('secret'));
  assert(!error.message.includes('secret'));
  for (const status of [401, 403, 404, 409, 422, 429]) assert(!retryQuery(0, normalizeError({ response: { status } })));
  assert(retryQuery(0, normalizeError({ code: 'ERR_NETWORK' })));
  assert(retryQuery(0, normalizeError({ response: { status: 503 } })));
  assert(!retryQuery(1, normalizeError({ code: 'ETIMEDOUT' })));
});

test('session projection excludes secrets and absent permissions deny access', () => {
  const value = normalizeSession({ user: { id: '1', name: 'Staff', token: 'secret' }, permissions: ['audit.read'], token: 'secret' });
  assert(!JSON.stringify(value).includes('secret'));
  assert(hasPermission(value, 'audit.read'));
  assert(!hasPermission(value, 'cards.read'));
  assert(!hasPermission(null, 'audit.read'));
  assert.throws(() => normalizeSession({ user: { id: '1' }, permissions: ['*'] }));
  assert.equal(routePermission('/inventory/receive'), 'inventory.receive');
  assert.equal(routePermission('/issuance/new'), 'issuance.issue');
  assert.equal(routePermission('/audit/'), 'audit.read');
});

test('service requires session and exact permission, with no production fixture fallback', async () => {
  const state = session();
  let loaded = 0;
  const api = createService('cards', { list: 'cards.read', freeze: 'cards.freeze' }, async () => { loaded += 1; return { cardsApi: { list: async () => ['demo'] } }; }, { mode: 'api', session: state, contract: null });
  await assert.rejects(api.list(), { code: 'UNAVAILABLE' });
  await assert.rejects(api.freeze(), { code: 'FORBIDDEN' });
  state.set(null);
  await assert.rejects(api.list(), { code: 'UNAUTHENTICATED' });
  assert.equal(loaded, 0);
});

test('production adapters own results and errors; late results cannot cross sessions', async () => {
  const state = session();
  let finish;
  const api = createService('cards', { list: 'cards.read' }, null, { mode: 'api', session: state, contract: { services: { cards: { list: () => new Promise(resolve => { finish = resolve; }) } } } });
  const pending = api.list();
  state.set(null); finish(['old-user-record']);
  await assert.rejects(pending, { code: 'CANCELED' });
  const denied = createService('cards', { list: 'cards.read' }, null, { mode: 'api', session: session(), contract: { services: { cards: { list: async () => { throw { response: { status: 403, data: { token: 'secret' } } }; } } } } });
  await assert.rejects(denied.list(), error => error.code === 'FORBIDDEN' && !JSON.stringify(error).includes('secret'));
});

test('audit options use audit permission independently of activity permission', async () => {
  const api = createService('activity', { options: audit => audit ? 'audit.read' : 'activity.read' }, async () => ({ activityApi: { options: async () => ['option'] } }), { mode: 'demo', session: session(['audit.read']) });
  assert.deepEqual(await api.options(true), ['option']);
  await assert.rejects(api.options(false), { code: 'FORBIDDEN' });
});

test('HTTP scopes credentials to configured service and rejects unsafe URL overrides', async () => {
  let calls = 0;
  const client = createHttpClient({ baseURL: '/api', session: session(), authorize: config => { config.headers.Authorization = 'Bearer memory-only'; }, adapter: async config => {
    calls += 1; assert.equal(config.headers.Authorization, 'Bearer memory-only');
    assert.equal(config.timeout, 30000); assert.equal(config.withCredentials, false);
    return { data: ['record'], status: 200, config };
  } });
  assert.deepEqual((await client.get('/cards', { params: { search: 'query' } })).data, ['record']);
  for (const url of ['https://other.test/cards', '//other.test/cards', '../cards', '/%2e%2e/cards', '/cards?token=secret', '/%2f%2fevil']) await assert.rejects(client.get(url), { code: 'REQUEST_FAILED' });
  await assert.rejects(client.get('/cards', { baseURL: 'https://other.test' }), { code: 'REQUEST_FAILED' });
  assert.equal(calls, 1);
});

test('HTTP 401 expires session; 403 preserves it; stale 401 cannot expire a newer session', async () => {
  for (const status of [401, 403]) {
    const state = session();
    const client = createHttpClient({ baseURL: '/api', session: state, adapter: async config => { throw { config, response: { status, data: { secret: 'secret' } } }; } });
    await assert.rejects(client.get('/cards'), { status });
    assert.equal(Boolean(state.get()), status !== 401);
  }
  const state = session();
  let rejectRequest;
  const client = createHttpClient({ baseURL: '/api', session: state, adapter: config => new Promise((resolve, reject) => { rejectRequest = () => reject({ config, response: { status: 401 } }); }) });
  const pending = client.get('/cards');
  await new Promise(resolve => setImmediate(resolve));
  state.set(normalizeSession({ user: { id: 'new-user', name: 'New user' }, permissions: [] }));
  rejectRequest();
  await assert.rejects(pending, { code: 'CANCELED' });
  assert.equal(state.get().user.id, 'new-user');
});

test('HTTP returns safe timeout/cancellation errors and does not send without a base URL', async () => {
  const closed = createHttpClient({ adapter: () => { assert.fail('must not request'); } });
  await assert.rejects(closed.get('/cards'), { code: 'UNAVAILABLE' });
  const client = createHttpClient({ baseURL: '/api', adapter: async config => { throw { config, code: 'ECONNABORTED', message: 'secret' }; } });
  await assert.rejects(client.post('/cards', { secret: 'secret' }), error => error.code === 'TIMEOUT' && !JSON.stringify(error).includes('secret'));
  const controller = new AbortController(); controller.abort();
  await assert.rejects(client.get('/cards', { signal: controller.signal }), { code: 'CANCELED' });
});

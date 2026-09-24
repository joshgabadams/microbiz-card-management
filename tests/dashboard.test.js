import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardSnapshot, dashboardFixture } from '../src/data/dashboardMock.js';

test('dashboard reconciles statuses and counts actual issuance records', () => {
  const result = buildDashboardSnapshot(dashboardFixture);
  assert.deepEqual(result.metrics, { total: 6, available: 2, issued: 4, active: 1, frozen: 1, blocked: 1, expired: 1, issuedToday: 0 });
  assert.equal(result.distribution.reduce((sum, row) => sum + row.count, 0), result.metrics.total);
  assert.equal(result.inventory.reduce((sum, row) => sum + row.available, 0), result.metrics.available);
  assert.deepEqual(result.recentIssuance.map(card => card.id), ['MBZ-001', 'MBZ-003', 'MBZ-004', 'MBZ-006']);
  assert.equal(result.attention.filter(item => item.kind === 'stock').length, 2);
});

test('branch scope applies to metrics, stock, attention, status and issuance', () => {
  const result = buildDashboardSnapshot(dashboardFixture, 'Gwarinpa');
  assert.equal(result.metrics.total, 1);
  assert.equal(result.metrics.available, 1);
  assert.equal(result.metrics.issued, 0);
  assert.deepEqual(result.attention, []);
  assert.deepEqual(result.recentIssuance, []);
  assert.deepEqual(result.distribution, [{ status: 'AVAILABLE', count: 1 }]);
  assert.equal(result.inventory.length, 1);
  assert.equal(result.inventory[0].name, 'Gwarinpa');
  assert.equal(result.branches.length, 4);
});

test('empty data gives zero metrics and no fabricated events or statuses', () => {
  const result = buildDashboardSnapshot({ reportingDate: '2026-09-24', branches: [], cards: [] });
  assert(Object.values(result.metrics).every(value => value === 0));
  for (const key of ['recentIssuance', 'inventory', 'attention', 'distribution']) assert.deepEqual(result[key], []);
});

test('snapshot date drives today; newest five issued records are masked without mutating fixtures', () => {
  const fixture = {
    reportingDate: '2026-09-24', branches: [{ name: 'Test', minimumAvailable: 1 }],
    cards: Array.from({ length: 7 }, (_, index) => ({ id: String(index), status: 'ACTIVE', branch: 'Test', pan: '1234567890123456', issuedOn: `2026-09-${24 - index}` })),
  };
  const before = JSON.stringify(fixture);
  const result = buildDashboardSnapshot(fixture);
  assert.equal(result.metrics.issuedToday, 1);
  assert.equal(result.recentIssuance.length, 5);
  assert.deepEqual(result.recentIssuance.map(card => card.id), ['0', '1', '2', '3', '4']);
  assert(result.recentIssuance.every(card => card.pan === '•••• •••• •••• 3456'));
  assert.equal(JSON.stringify(fixture), before);
});

test('unknown statuses remain visible and zero-stock branches remain represented', () => {
  const result = buildDashboardSnapshot({ reportingDate: '2026-09-24', branches: [{ name: 'Empty', minimumAvailable: 1 }], cards: [{ id: 'future', branch: 'Empty', status: 'FUTURE_STATUS' }] });
  assert.deepEqual(result.distribution, [{ status: 'FUTURE_STATUS', count: 1 }]);
  assert.equal(result.inventory[0].available, 0);
  assert.equal(result.inventory[0].lowStock, true);
});

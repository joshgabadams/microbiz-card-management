import test from 'node:test';
import assert from 'node:assert/strict';
import { createIssuanceStore } from '../src/data/issuanceMock.js';
import { createInventoryStore } from '../src/data/inventoryMock.js';
import { buildDashboardSnapshot } from '../src/data/dashboardMock.js';

function fixture() {
  const people = [{ id: 'customer-1', name: 'Demo Customer', account: '1234567890', phone: '080••••1234', status: 'ACTIVE', branch: 'Head Office' }];
  const accounts = [{ id: 'account-1', customerId: 'customer-1', number: '1234567890', eligible: true, status: 'ACTIVE', products: ['Professional Debit'], branch: 'Head Office' }];
  const cards = [{ id: 'card-1', serial: 'SERIAL-1', pan: '1234567890123456', status: 'AVAILABLE', product: 'Professional Debit', branch: 'Head Office', expiry: '09/28', batch: 'BATCH-1', receivedOn: '2026-09-24' }];
  return { people, accounts, cards, store: createIssuanceStore(cards, people, accounts), input: { requestId: 'request-1', customerId: 'customer-1', accountId: 'account-1', cardId: 'card-1' } };
}

test('customer lookup supports names, IDs and accounts, returns masked independent profiles', () => {
  const { store, accounts } = fixture();
  for (const query of [' demo ', 'CUSTOMER-1', '1234567890', '1234']) assert.equal(store.search(query).length, 1);
  assert.deepEqual(store.search('x'), []);
  assert.deepEqual(store.search('unknown'), []);
  assert.equal(store.get('missing'), null);
  const profile = store.get('customer-1');
  assert(!profile.account.includes('1234567890'));
  profile.accounts[0].products.push('Other');
  assert.deepEqual(accounts[0].products, ['Professional Debit']);
});

test('issuance updates inventory, customer relationship, history and dashboard consistently', () => {
  const { store, cards, input } = fixture();
  const receipt = store.issue(input);
  assert.equal(cards[0].status, 'ISSUED');
  assert.equal(cards[0].customerId, input.customerId);
  assert.equal(cards[0].accountId, input.accountId);
  assert.equal(receipt.pan, '•••• •••• •••• 3456');
  assert.equal(store.available(input.customerId, input.accountId).length, 0);
  assert.equal(store.get(input.customerId).cards.length, 1);
  assert.equal(createInventoryStore(cards).list().batches[0].available, 0);
  const dashboard = buildDashboardSnapshot({ cards, branches: [], reportingDate: '2026-09-24' });
  assert.equal(dashboard.metrics.issuedToday, 1);
  assert.equal(dashboard.metrics.available, 0);
  assert.equal(dashboard.metrics.active, 0);
  assert.equal(store.history().length, 1);
});

test('same request retries are idempotent; conflicting retries and double issuance fail', () => {
  const { store, input } = fixture();
  const first = store.issue(input);
  assert.deepEqual(store.issue(input), first);
  assert.throws(() => store.issue({ ...input, accountId: 'different' }));
  assert.throws(() => store.issue({ ...input, requestId: 'another' }));
  assert.equal(store.history().length, 1);
});

test('eligibility is revalidated at submission with no partial mutations', () => {
  for (const change of [
    ({ people }) => { people[0].status = 'INACTIVE'; },
    ({ accounts }) => { accounts[0].eligible = false; },
    ({ accounts }) => { accounts[0].status = 'INACTIVE'; },
    ({ accounts }) => { accounts[0].customerId = 'someone-else'; },
    ({ cards }) => { cards[0].branch = 'Mpape'; },
    ({ cards }) => { cards[0].product = 'Business Debit'; },
    ({ cards }) => { cards[0].status = 'BLOCKED'; },
    ({ cards }) => { cards[0].expiry = '08/26'; },
    ({ cards }) => { cards[0].expiry = '19/28'; },
  ]) {
    const setup = fixture();
    assert.equal(setup.store.available(setup.input.customerId, setup.input.accountId).length, 1);
    change(setup);
    const before = structuredClone(setup.cards);
    assert.throws(() => setup.store.issue(setup.input));
    assert.deepEqual(setup.cards, before);
    assert.deepEqual(setup.store.history(), []);
  }
});

test('PIN, CVV and unexpected payload fields are rejected without recording an event', () => {
  for (const key of ['pin', 'defaultPin', 'cvv', 'pan']) {
    const { store, input, cards } = fixture();
    assert.throws(() => store.issue({ ...input, [key]: 'sensitive' }));
    assert.equal(cards[0].status, 'AVAILABLE');
    assert.equal(store.history().length, 0);
  }
});

test('missing customer, account, card or request references cannot issue stock', () => {
  for (const key of ['requestId', 'customerId', 'accountId', 'cardId']) {
    const { store, input } = fixture();
    assert.throws(() => store.issue({ ...input, [key]: '' }));
    assert.deepEqual(store.history(), []);
  }
});

test('history and receipt copies cannot mutate stored events', () => {
  const { store, input } = fixture();
  const receipt = store.issue(input);
  receipt.customer = 'Changed';
  store.history()[0].status = 'ACTIVE';
  assert.equal(store.issue(input).customer, 'Demo Customer');
  assert.equal(store.history()[0].status, 'ISSUED');
});

test('cards received in the same session become issuable through shared stock', () => {
  const { store, cards, input } = fixture();
  const inventory = createInventoryStore(cards);
  inventory.receive({ requestId: 'receive-1', batch: 'BATCH-2', product: 'Professional Debit', scheme: 'Verve', branch: 'Head Office', receivedOn: '2026-09-24', quantity: 1, cards: [{ serial: 'SERIAL-NEW', lastFour: '7788', expiry: '2028-09' }] });
  const added = store.available(input.customerId, input.accountId).find(card => card.serial === 'SERIAL-NEW');
  assert(added);
  store.issue({ ...input, cardId: added.id });
  assert.equal(inventory.list().batches.find(batch => batch.batch === 'BATCH-2').available, 0);
});

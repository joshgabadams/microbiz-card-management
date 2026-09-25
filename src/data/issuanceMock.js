import { cards, customers } from './mockData.js';
import { inventoryReference } from './inventoryReference.js';
import { maskPan } from '../utils/maskPan.js';
import { maskAccount } from '../utils/maskAccount.js';

// Illustrative capabilities, not bank eligibility or authorization policy.
export const customerAccounts = customers.flatMap(customer => [
  { id: `${customer.id}-savings`, customerId: customer.id, number: customer.account, type: 'Savings', status: 'ACTIVE', eligible: true, products: ['Professional Debit'], branch: customer.branch },
  { id: `${customer.id}-business`, customerId: customer.id, number: `900${customer.account.slice(3)}`, type: 'Business', status: 'ACTIVE', eligible: true, products: ['Business Debit'], branch: customer.branch },
  { id: `${customer.id}-restricted`, customerId: customer.id, number: `800${customer.account.slice(3)}`, type: 'Savings', status: 'INACTIVE', eligible: false, reason: 'Demo account is inactive.', products: [], branch: customer.branch },
]);

export function createIssuanceStore(records, people, accounts, reportingDate = inventoryReference.reportingDate) {
  const requests = new Map();
  const history = records.filter(card => card.issuedOn).map(card => ({
    id: `historical-${card.id}`, cardId: card.id, customerId: people.find(person => person.name === card.customer)?.id,
    customer: card.customer, account: maskAccount(card.account), serial: card.serial, pan: maskPan(card.pan),
    product: card.product, branch: card.branch, issuedOn: card.issuedOn, status: 'ISSUED', operator: 'Demo operator',
  }));
  const accountView = account => ({ ...account, number: maskAccount(account.number), products: [...account.products] });
  function search(query) {
    const term = String(query || '').trim().toLowerCase();
    if (term.length < 2) return [];
    return people.filter(person => [person.name, person.id, person.phone, ...accounts.filter(account => account.customerId === person.id).map(account => account.number)].some(value => value.toLowerCase().includes(term)))
      .map(person => ({ ...person, account: maskAccount(person.account) }));
  }
  function get(customerId) {
    const person = people.find(item => item.id === customerId);
    return person ? { ...person, account: maskAccount(person.account), accounts: accounts.filter(account => account.customerId === customerId).map(accountView), cards: records.filter(card => card.customerId === customerId || (!card.customerId && card.customer === person.name)).map(card => ({ ...card, pan: maskPan(card.pan) })) } : null;
  }
  function available(customerId, accountId) {
    const person = people.find(item => item.id === customerId);
    const account = accounts.find(item => item.id === accountId && item.customerId === customerId);
    if (person?.status !== 'ACTIVE' || !account?.eligible || account.status !== 'ACTIVE') return [];
    return records.filter(card => card.status === 'AVAILABLE' && card.branch === account.branch && account.products.includes(card.product) && /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry) && `20${card.expiry.slice(3)}-${card.expiry.slice(0, 2)}` >= reportingDate.slice(0, 7)).map(card => ({ ...card, pan: maskPan(card.pan) }));
  }
  function issue(input) {
    if (!input || typeof input.requestId !== 'string' || !input.requestId) throw new Error('A request reference is required.');
    if (Object.keys(input).some(key => !['requestId', 'customerId', 'accountId', 'cardId'].includes(key))) throw new Error('Only customer, account and card references are accepted.');
    const signature = JSON.stringify([input.customerId, input.accountId, input.cardId]);
    const previous = requests.get(input.requestId);
    if (previous) {
      if (previous.signature !== signature) throw new Error('This request reference has already been used for another selection.');
      return { ...previous.receipt };
    }
    if (!available(input.customerId, input.accountId).some(card => card.id === input.cardId)) throw new Error('The selection is no longer eligible. Review the account and choose available stock again.');
    const person = people.find(item => item.id === input.customerId);
    const account = accounts.find(item => item.id === input.accountId);
    const card = records.find(item => item.id === input.cardId);
    const receipt = { id: `ISS-${input.requestId}`, cardId: card.id, customerId: person.id, customer: person.name, account: maskAccount(account.number), accountType: account.type, serial: card.serial, pan: maskPan(card.pan), product: card.product, branch: card.branch, issuedOn: reportingDate, status: 'ISSUED', operator: 'Demo operator' };
    Object.assign(card, { customerId: person.id, accountId: account.id, customer: person.name, account: receipt.account, status: 'ISSUED', issuedOn: reportingDate, issuedAt: reportingDate });
    history.unshift(receipt);
    requests.set(input.requestId, { signature, receipt });
    return { ...receipt };
  }
  return { search, get, available, issue, history: () => history.map(item => ({ ...item })).sort((a, b) => b.issuedOn.localeCompare(a.issuedOn)) };
}

export const issuanceStore = createIssuanceStore(cards, customers, customerAccounts);

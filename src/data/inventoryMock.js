import { activityStore } from './activityStore.js';
import { cards } from './mockData.js';
import { inventoryReference } from './inventoryReference.js';
import { validateReceipt } from '../features/inventory/validateReceipt.js';
import { maskPan } from '../utils/maskPan.js';

export function createInventoryStore(records, reference = inventoryReference, events = null) {
  const receipts = new Map();
  function list() {
    const rows = records.map(card => ({ ...card, pan: maskPan(card.pan) }));
    const grouped = new Map();
    for (const card of rows) {
      if (!grouped.has(card.batch)) grouped.set(card.batch, { id: card.batch, batch: card.batch, branch: card.branch, product: card.product, scheme: card.scheme, receivedOn: card.receivedOn, receivedBy: card.receivedBy, cards: [] });
      grouped.get(card.batch).cards.push(card);
    }
    return {
      reference: { ...reference, branches: [...reference.branches], products: [...reference.products], schemes: [...reference.schemes] },
      cards: rows,
      batches: [...grouped.values()].map(batch => ({ ...batch, quantity: batch.cards.length, available: batch.cards.filter(card => card.status === 'AVAILABLE').length })).sort((a, b) => b.receivedOn.localeCompare(a.receivedOn) || a.batch.localeCompare(b.batch)),
    };
  }
  function receive(input) {
    if (typeof input.requestId !== 'string' || !input.requestId) throw new Error('A request reference is required.');
    // Idempotent retries in this demo tab; production idempotency belongs to the API.
    if (receipts.has(input.requestId)) return { ...receipts.get(input.requestId) };
    const errors = validateReceipt(input, reference, records);
    if (Object.keys(errors).length) {
      const error = new Error('Check the batch details and card rows before receiving stock.');
      error.fieldErrors = errors;
      throw error;
    }
    const batch = input.batch.trim().toUpperCase();
    const additions = input.cards.map(row => ({
      id: `stock-${batch}-${row.serial.trim().toUpperCase()}`,
      serial: row.serial.trim().toUpperCase(), pan: maskPan(row.lastFour),
      product: input.product, scheme: input.scheme, branch: input.branch,
      batch, receivedOn: input.receivedOn, receivedBy: reference.receivedBy,
      expiry: `${row.expiry.slice(5)}/${row.expiry.slice(2, 4)}`,
      status: 'AVAILABLE', customer: '—', account: '—', issuedAt: '—',
    }));
    // Validate the whole batch before changing any records. Never persist to browser storage.
    records.push(...additions);
    const receipt = { batch, quantity: additions.length, branch: input.branch, receivedOn: input.receivedOn, receivedBy: reference.receivedBy };
    receipts.set(input.requestId, receipt);
    const timestamp = new Date().toISOString();
    additions.forEach(card => events?.append({
      id: `RECEIVED-${card.id}`, reference: batch, cardId: card.id, serial: card.serial, pan: card.pan,
      branch: card.branch, customer: '—', action: 'RECEIVED', actor: reference.receivedBy,
      timestamp, note: `Batch ${batch}; received on ${card.receivedOn}.`,
    }));
    return { ...receipt };
  }
  return { list, receive };
}

export const inventoryStore = createInventoryStore(cards, inventoryReference, activityStore);

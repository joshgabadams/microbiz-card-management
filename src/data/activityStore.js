import { activityEvents } from './activityMock.js';
import { maskPan } from '../utils/maskPan.js';

// Demo classification only; production audit scope is supplied by the API.
const auditActions = new Set(['RECEIVED', 'ISSUED', 'FROZEN', 'UNFROZEN', 'UNLINKED', 'REASSIGNED', 'BLOCKED', 'REPLACED']);
const lagosDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' });

export function createActivityStore(seed = []) {
  const events = new Map();
  function append(input) {
    if (events.has(input.id)) return { ...events.get(input.id) };
    // Explicit projection: never copy a mutation payload or sensitive card fields.
    const event = {
      id: input.id, cardId: input.cardId, serial: input.serial, pan: maskPan(input.pan),
      customer: input.customer || '—', branch: input.branch, action: input.action,
      actor: input.actor, timestamp: input.timestamp, reference: input.reference || input.id,
      note: input.note || null,
    };
    events.set(event.id, Object.freeze(event));
    return { ...event };
  }
  seed.forEach(append);
  function list(filters = {}, audit = false) {
    const { action, branch, actor, search = '', reference = '', from = '', to = '', cardId } = filters;
    const term = search.trim().toLowerCase();
    const ref = reference.trim().toLowerCase();
    return [...events.values()].filter(event => {
      const date = lagosDate.format(new Date(event.timestamp));
      return (!audit || auditActions.has(event.action)) &&
        (!action || event.action === action) && (!branch || event.branch === branch) &&
        (!actor || event.actor === actor) && (!cardId || event.cardId === cardId) &&
        (!from || date >= from) && (!to || date <= to) &&
        (!ref || [event.id, event.reference, event.cardId, event.serial].some(value => value.toLowerCase().includes(ref))) &&
        (!term || [event.id, event.reference, event.serial, event.pan, event.customer, event.cardId].some(value => value.toLowerCase().includes(term)));
    }).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp) || a.id.localeCompare(b.id))
      .map(event => ({ ...event }));
  }
  return {
    append, list,
    get: id => events.has(id) ? { ...events.get(id) } : null,
    options: (audit = false) => {
      const rows = list({}, audit);
      return Object.fromEntries(['action', 'branch', 'actor'].map(key => [key, [...new Set(rows.map(row => row[key]))].sort()]));
    },
  };
}

export const activityStore = createActivityStore(activityEvents);

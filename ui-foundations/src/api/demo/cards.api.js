import { activityStore } from '../../data/activityStore.js';
import { formatEventTime } from '../../utils/eventTime.js';
import { cards } from '../../data/mockData.js';

// Development adapter only. Replace capabilities after receiving the API contract.
const unavailable = async (action) => {
  throw new Error(`${action} is not yet available — awaiting API contract.`);
};

export const cardsApi = {
  list: async () => cards.map(card => ({ ...card })),
  get: async cardId => {
    const card = cards.find(item => item.id === cardId);
    return card ? { ...card } : null;
  },
  // Returns full card detail including timeline events.
  getDetail: async cardId => {
    const card = cards.find(item => item.id === cardId);
    return card ? { ...card, allowedActions: [], timeline: activityStore.list({ cardId }).map(event => ({
      event: event.action, actor: event.actor, timestamp: `${formatEventTime(event.timestamp)} WAT`, note: event.note,
    })) } : null;
  },
  available: async () => cards.filter(card => card.status === 'AVAILABLE').map(card => ({ ...card })),
  issue:     async () => unavailable('Issue'),
  activate:  async (_cardId, _reason) => unavailable('Activate'),
  freeze:    async (_cardId, _reason) => unavailable('Freeze'),
  unfreeze:  async (_cardId, _reason) => unavailable('Unfreeze'),
  block:     async (_cardId, _reason) => unavailable('Block'),
  unlink:    async (_cardId, _reason) => unavailable('Unlink'),
  reassign:  async (_cardId, _reason) => unavailable('Reassign'),
};

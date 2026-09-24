import { cards } from '../data/mockData';

// Development adapter only. Replace capabilities after receiving the API contract.
const unavailable = async () => { throw new Error('This operation is not available yet.'); };
export const cardsApi = {
  list: async () => cards.map(card => ({ ...card })),
  get: async cardId => {
    const card = cards.find(item => item.id === cardId);
    return card ? { ...card } : null;
  },
  available: async () => cards.filter(card => card.status === 'AVAILABLE').map(card => ({ ...card })),
  issue: unavailable,
  freeze: unavailable,
  unfreeze: unavailable,
  block: unavailable,
  unlink: unavailable,
};

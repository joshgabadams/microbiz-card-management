import { inventoryStore } from '../../data/inventoryMock.js';

// Mock capability adapter. No production endpoint paths are assumed.
export const inventoryApi = {
  list: async () => inventoryStore.list(),
  receive: async payload => inventoryStore.receive(payload),
};

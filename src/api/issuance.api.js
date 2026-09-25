import { issuanceStore } from '../data/issuanceMock.js';

export const issuanceApi = {
  available: async (customerId, accountId) => issuanceStore.available(customerId, accountId),
  issue: async input => issuanceStore.issue(input),
  history: async () => issuanceStore.history(),
};

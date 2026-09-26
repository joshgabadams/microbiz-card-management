import { issuanceStore } from '../../data/issuanceMock.js';
// Demo capability adapter; production URLs and eligibility await the API contract.
export const customersApi = {
  search: async query => issuanceStore.search(query),
  get: async customerId => issuanceStore.get(customerId),
};

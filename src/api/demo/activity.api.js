import { activityStore } from '../../data/activityStore.js';

// In-memory capability adapter. Production audit integrity belongs to the backend.
export const activityApi = {
  list: async (filters = {}) => activityStore.list(filters),
  audit: async (filters = {}) => activityStore.list(filters, true),
  options: async (audit = false) => activityStore.options(audit),
  getEvent: async eventId => activityStore.get(eventId),
};

import { createService } from './service.js';
export const issuanceApi = createService('issuance', {"available": "issuance.issue", "issue": "issuance.issue", "history": "issuance.read"}, () => (import.meta.env.DEV || import.meta.env.VITE_DATA_MODE === 'demo') ? import('./demo/issuance.api.js') : null);

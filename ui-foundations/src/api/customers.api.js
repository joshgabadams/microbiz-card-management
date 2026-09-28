import { createService } from './service.js';
export const customersApi = createService('customers', {"search": "customers.read", "get": "customers.read"}, () => (import.meta.env.DEV || import.meta.env.VITE_DATA_MODE === 'demo') ? import('./demo/customers.api.js') : null);

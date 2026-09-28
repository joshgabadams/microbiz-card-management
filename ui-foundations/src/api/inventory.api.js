import { createService } from './service.js';
export const inventoryApi = createService('inventory', {"list": "inventory.read", "receive": "inventory.receive"}, () => (import.meta.env.DEV || import.meta.env.VITE_DATA_MODE === 'demo') ? import('./demo/inventory.api.js') : null);

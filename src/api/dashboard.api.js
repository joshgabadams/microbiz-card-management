import { createService } from './service.js';
export const dashboardApi = createService('dashboard', {"getSummary": "dashboard.read"}, () => (import.meta.env.DEV || import.meta.env.VITE_DATA_MODE === 'demo') ? import('./demo/dashboard.api.js') : null);

import { createService } from './service.js';
export const activityApi = createService('activity', {"list": "activity.read", "audit": "audit.read", "options": audit => audit ? "audit.read" : "activity.read", "getEvent": "audit.read"}, () => (import.meta.env.DEV || import.meta.env.VITE_DATA_MODE === 'demo') ? import('./demo/activity.api.js') : null);

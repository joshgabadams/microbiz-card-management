import axios from 'axios';
import { environment } from '../config/environment.js';
import { sessionStore } from '../services/session.js';
import { ApiError, normalizeError } from './errors.js';

// Authentication is opt-in through the reviewed backend adapter. No token storage,
// refresh endpoint, cookie policy or CSRF header is guessed here.
export function createHttpClient({ baseURL, authorize, withCredentials = false, session = sessionStore, adapter } = {}) {
  const client = axios.create({ baseURL, timeout: 30000, withCredentials, headers: { Accept: 'application/json' }, ...(adapter ? { adapter } : {}) });
  client.interceptors.request.use(async config => {
    if (!baseURL) throw new ApiError('UNAVAILABLE');
    // All authenticated requests must stay beneath the configured API base URL.
    if (config.baseURL !== baseURL || !config.url || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(config.url) || /[\\?#]/.test(config.url) || config.url.split('/').some(segment => { try { return ['.', '..'].includes(decodeURIComponent(segment)) || /[\\/]/.test(decodeURIComponent(segment)); } catch { return true; } })) throw new ApiError('REQUEST_FAILED');
    config.sessionRevision = session.revision();
    if (authorize) await authorize(config);
    if (config.sessionRevision !== session.revision()) throw new ApiError('CANCELED');
    return config;
  });
  client.interceptors.response.use(response => {
    if (response.config.sessionRevision !== session.revision()) throw new ApiError('CANCELED');
    return response;
  }, error => {
    if (error?.config && error.config.sessionRevision !== session.revision()) return Promise.reject(new ApiError('CANCELED'));
    const safe = normalizeError(error);
    if (safe.status === 401) session.set(null, 'expired');
    return Promise.reject(safe);
  });
  return client;
}
export const http = createHttpClient({ baseURL: environment.baseURL });

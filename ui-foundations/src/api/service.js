import { environment } from '../config/environment.js';
import { productionContract } from './productionContract.js';
import { ApiError, normalizeError } from './errors.js';
import { hasPermission, sessionStore } from '../services/session.js';

export function createService(domain, methods, loadDemo, { mode = environment.mode, contract = productionContract, session = sessionStore } = {}) {
  return Object.fromEntries(Object.entries(methods).map(([method, permission]) => [method, async (...args) => {
    const revision = session.revision();
    if (!session.get()) throw new ApiError('UNAUTHENTICATED', 401);
    if (!hasPermission(session.get(), typeof permission === 'function' ? permission(...args) : permission)) throw new ApiError('FORBIDDEN', 403);
    const adapter = mode === 'demo' ? (await loadDemo())[`${domain}Api`] : contract?.services?.[domain];
    if (typeof adapter?.[method] !== 'function') throw new ApiError('UNAVAILABLE');
    if (revision !== session.revision()) throw new ApiError('CANCELED');
    try {
      const result = await adapter[method](...args);
      if (revision !== session.revision()) throw new ApiError('CANCELED');
      return result;
    } catch (error) {
      if (revision !== session.revision()) throw new ApiError('CANCELED');
      if (mode === 'demo') throw error;
      const safe = normalizeError(error);
      if (safe.status === 401) session.set(null, 'expired');
      throw safe;
    }
  }]));
}

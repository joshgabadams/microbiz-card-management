let session = null;
let revision = 0;
let reason = null;
const listeners = new Set();
export const sessionStore = {
  get: () => session,
  revision: () => revision,
  reason: () => reason,
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  set(value, nextReason = null) {
    session = value;
    reason = nextReason;
    revision += 1;
    listeners.forEach(listener => listener());
  },
};
export function hasPermission(session, permission) {
  return Boolean(session && typeof permission === 'string' && Array.isArray(session.permissions) && session.permissions.includes(permission));
}
export function normalizeSession(value) {
  if (!value) return null;
  if (typeof value.user?.id !== 'string' || !value.user.id || typeof value.user?.name !== 'string' || !Array.isArray(value.permissions) || !value.permissions.every(item => typeof item === 'string')) throw new Error('Invalid session contract');
  // Tokens belong to the contract-owned transport closure, never React state.
  return Object.freeze({ user: Object.freeze({ id: value.user.id, name: value.user.name }), permissions: Object.freeze([...value.permissions]) });
}

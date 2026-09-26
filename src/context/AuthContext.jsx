import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { environment } from '../config/environment.js';
import { demoPermissions, routePermission } from '../config/permissions.js';
import { productionContract } from '../api/productionContract.js';
import { ApiError, normalizeError } from '../api/errors.js';
import { hasPermission, normalizeSession, sessionStore } from '../services/session.js';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const client = useQueryClient();
  const [session, setSession] = useState(sessionStore.get);
  const [sessionVersion, setSessionVersion] = useState(sessionStore.revision);
  const [busy, setBusy] = useState(environment.mode === 'api');
  const [error, setError] = useState(null);
  const operation = useRef(0);
  const demo = environment.mode === 'demo';
  useEffect(() => sessionStore.subscribe(() => {
    // Invalidate pending bootstrap/sign-in work and every user's cached data.
    operation.current += 1;
    client.cancelQueries();
    client.clear();
    setSession(sessionStore.get());
    setSessionVersion(sessionStore.revision());
    setBusy(false);
    if (sessionStore.reason() === 'expired') setError(new ApiError('UNAUTHENTICATED', 401));
  }), [client]);
  async function authenticate(restore = false) {
    const current = ++operation.current;
    setBusy(true); setError(null);
    try {
      const auth = productionContract?.auth;
      if (!demo && typeof auth?.[restore ? 'getSession' : 'signIn'] !== 'function') throw new ApiError('UNAVAILABLE');
      const result = demo ? { user: { id: 'demo-operator', name: 'Demo Operator' }, permissions: demoPermissions } : await auth[restore ? 'getSession' : 'signIn']();
      if (operation.current !== current) return;
      sessionStore.set(normalizeSession(result));
    } catch (failure) {
      if (operation.current === current) {
        sessionStore.set(null);
        setError(normalizeError(failure));
      }
    } finally { if (operation.current === current) setBusy(false); }
  }
  useEffect(() => {
    if (!demo) authenticate(true);
    return () => { operation.current += 1; };
  }, []);
  async function signOut() {
    const auth = productionContract?.auth;
    sessionStore.set(null);
    setError(null);
    if (demo) {
      // Reload discards module-owned mock stores as well as query data.
      window.location.replace('/login');
      return;
    }
    setBusy(true);
    try {
      if (typeof auth?.signOut !== 'function') throw new ApiError('UNAVAILABLE');
      await auth.signOut();
    } catch {
      setError(new ApiError('REQUEST_FAILED'));
    } finally { setBusy(false); }
  }
  const can = permission => hasPermission(session, permission);
  return <AuthContext.Provider value={{ session, sessionVersion, busy, error, demo, signInAvailable: demo || typeof productionContract?.auth?.signIn === 'function', signIn: () => authenticate(), signOut, can, canVisit: path => can(routePermission(path)) }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

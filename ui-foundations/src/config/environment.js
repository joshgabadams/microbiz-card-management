export function readEnvironment(env = {}) {
  const mode = env.VITE_DATA_MODE || (env.DEV ? 'demo' : 'api');
  if (!['demo', 'api'].includes(mode)) throw new Error('VITE_DATA_MODE must be demo or api.');
  const baseURL = env.VITE_API_BASE_URL || '';
  if (baseURL) {
    const relative = /^\/(?!\/)/.test(baseURL) && !/[\\?#]/.test(baseURL);
    let secure = false;
    try { const url = new URL(baseURL); secure = url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash; } catch { /* Relative URLs are checked above. */ }
    if (!relative && !secure) throw new Error('Use an HTTPS API URL or a same-origin absolute path.');
  }
  return Object.freeze({ mode, baseURL });
}
export const environment = readEnvironment(import.meta.env || { DEV: true });

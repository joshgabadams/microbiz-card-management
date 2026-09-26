const messages = {
  UNAUTHENTICATED: 'Your session has ended. Sign in again to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested record was not found.',
  CONFLICT: 'This record has changed. Refresh it before trying again.',
  VALIDATION: 'Check your entries and try again.',
  RATE_LIMITED: 'Too many requests. Please wait before trying again.',
  TIMEOUT: 'The request timed out. Refresh the record to check its state before retrying an action.',
  NETWORK: 'Unable to reach the service. Check your connection and try again.',
  CANCELED: 'The request was canceled.',
  UNAVAILABLE: 'This service is not connected yet.',
  REQUEST_FAILED: 'The request could not be completed. Please try again.',
};
export class ApiError extends Error {
  constructor(code, status = null) {
    super(messages[code] || messages.REQUEST_FAILED);
    this.name = 'ApiError';
    this.code = Object.hasOwn(messages, code) ? code : 'REQUEST_FAILED';
    this.status = status;
  }
}
// Never retain Axios config, headers, request, response body or server messages.
export function normalizeError(error) {
  if (error instanceof ApiError) return error;
  const status = Number.isInteger(error?.response?.status) ? error.response.status : null;
  const code = ({ 401: 'UNAUTHENTICATED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'VALIDATION', 429: 'RATE_LIMITED' })[status]
    || (error?.code === 'ERR_CANCELED' ? 'CANCELED' : ['ECONNABORTED', 'ETIMEDOUT'].includes(error?.code) ? 'TIMEOUT' : error?.code === 'ERR_NETWORK' ? 'NETWORK' : 'REQUEST_FAILED');
  return new ApiError(code, status);
}
export const retryQuery = (failureCount, error) => failureCount < 1 && (error?.code === 'NETWORK' || error?.code === 'TIMEOUT' || error?.status >= 500);

import { http } from './http';
export const customersApi = {
  search: params => http.get('/customers/search', { params }).then(r => r.data),
  get: customerId => http.get(`/customers/${customerId}`).then(r => r.data),
  accounts: customerId => http.get(`/customers/${customerId}/accounts`).then(r => r.data),
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import { issuanceApi } from '../api/issuance.api';

export function useCustomerSearch(query) {
  return useQuery({ queryKey: ['customers', 'search', query], queryFn: () => customersApi.search(query), enabled: query.trim().length >= 2 });
}
export function useCustomer(id) {
  return useQuery({ queryKey: ['customers', 'profile', id], queryFn: () => customersApi.get(id), enabled: Boolean(id) });
}
export function useIssuableCards(customerId, accountId) {
  return useQuery({ queryKey: ['cards', 'issuable', customerId, accountId], queryFn: () => issuanceApi.available(customerId, accountId), enabled: Boolean(customerId && accountId) });
}
export function useIssuanceHistory() {
  return useQuery({ queryKey: ['issuance', 'history'], queryFn: issuanceApi.history });
}
export function useIssueCard() {
  const client = useQueryClient();
  return useMutation({ mutationFn: issuanceApi.issue, retry: false, onSuccess: () => Promise.all(['cards', 'inventory', 'dashboard', 'customers', 'issuance'].map(key => client.invalidateQueries({ queryKey: [key] }))) });
}

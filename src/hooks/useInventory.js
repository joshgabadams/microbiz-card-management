import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';

export function useInventory() {
  return useQuery({ queryKey: ['inventory'], queryFn: inventoryApi.list });
}
export function useReceiveInventory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.receive,
    retry: false,
    onSuccess: () => {
      // Refresh every view sharing the demo card estate, including branch summaries.
      return Promise.all(['inventory', 'cards', 'dashboard'].map(key => client.invalidateQueries({ queryKey: [key] })));
    },
  });
}

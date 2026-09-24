import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboard(branch) {
  return useQuery({
    queryKey: ['dashboard', { branch }],
    queryFn: () => dashboardApi.getSummary({ branch }),
  });
}

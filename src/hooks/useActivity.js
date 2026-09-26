import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../api/activity.api.js';

export function useEventLog(filters = {}, audit = false) {
  return useQuery({
    queryKey: [audit ? 'audit' : 'activity', 'events', filters],
    queryFn: () => audit ? activityApi.audit(filters) : activityApi.list(filters),
  });
}
export function useEventOptions(audit = false) {
  return useQuery({
    queryKey: [audit ? 'audit' : 'activity', 'options'],
    queryFn: () => activityApi.options(audit),
  });
}

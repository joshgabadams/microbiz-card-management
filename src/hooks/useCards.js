import { useQuery } from '@tanstack/react-query';
import { cardsApi } from '../api/cards.api';

export function useCards() {
  return useQuery({ queryKey: ['cards'], queryFn: cardsApi.list });
}

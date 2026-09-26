import { useQuery } from '@tanstack/react-query';
import { cardsApi } from '../api/cards.api';

/**
 * Fetches full card detail including timeline events for the Card Profile page.
 * @param {string} cardId
 */
export function useCardDetail(cardId) {
  return useQuery({
    queryKey: ['card', cardId],
    queryFn: () => cardsApi.getDetail(cardId),
    enabled: Boolean(cardId),
  });
}

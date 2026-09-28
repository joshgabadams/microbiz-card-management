import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '../api/cards.api';

/**
 * Provides lifecycle mutation functions for a specific card.
 * Each mutation invalidates both the card detail and the card list queries on settle.
 *
 * @param {string} cardId
 * @returns {{ activate, freeze, unfreeze, block, unlink, reassign }} — each is a useMutation result
 */
export function useCardActions(cardId) {
  const queryClient = useQueryClient();

  function makeInvalidator() {
    return {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['card', cardId] });
        ['cards', 'customers', 'inventory', 'dashboard', 'activity', 'audit'].forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
      },
    };
  }

  const activate = useMutation({
    mutationFn: reason => cardsApi.activate(cardId, reason),
    ...makeInvalidator(),
  });

  const freeze = useMutation({
    mutationFn: reason => cardsApi.freeze(cardId, reason),
    ...makeInvalidator(),
  });

  const unfreeze = useMutation({
    mutationFn: reason => cardsApi.unfreeze(cardId, reason),
    ...makeInvalidator(),
  });

  const block = useMutation({
    mutationFn: reason => cardsApi.block(cardId, reason),
    ...makeInvalidator(),
  });

  const unlink = useMutation({
    mutationFn: reason => cardsApi.unlink(cardId, reason),
    ...makeInvalidator(),
  });

  const reassign = useMutation({
    mutationFn: reason => cardsApi.reassign(cardId, reason),
    ...makeInvalidator(),
  });

  return { activate, freeze, unfreeze, block, unlink, reassign };
}

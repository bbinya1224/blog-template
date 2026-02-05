'use client';

import { useCallback } from 'react';
import { useChatMessagesJotai } from './use-chat-messages-jotai';
import { MESSAGES } from '../constants/messages';
import type { PlaceCardMetadata } from '@/entities/chat-message';
import type { SearchResult } from '@/shared/lib/search';

export function usePlaceSearch() {
  const { addAssistantMessage } = useChatMessagesJotai();

  const searchPlace = useCallback(
    async (query: string) => {
      try {
        const response = await fetch('/api/place/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) throw new Error('Place search failed');

        const result: SearchResult = await response.json();

        if (result.kakaoPlace) {
          const placeMetadata: PlaceCardMetadata = {
            name: result.kakaoPlace.name,
            category: result.kakaoPlace.category,
            address: result.kakaoPlace.address,
            roadAddress: result.kakaoPlace.roadAddress,
            phone: result.kakaoPlace.phone,
            mapLink: result.kakaoPlace.mapLink,
          };

          addAssistantMessage(
            MESSAGES.infoGathering.restaurant.placeConfirm,
            'place-card',
            undefined,
            placeMetadata as unknown as Record<string, unknown>
          );
        } else {
          addAssistantMessage(MESSAGES.infoGathering.restaurant.placeNotFound, 'text');
        }
      } catch {
        addAssistantMessage(MESSAGES.infoGathering.restaurant.placeNotFound, 'text');
      }
    },
    [addAssistantMessage]
  );

  return { searchPlace };
}

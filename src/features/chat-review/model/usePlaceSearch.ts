'use client';

import { useCallback } from 'react';
import { useChatMessages } from './useChatMessages';
import { MESSAGES } from '../constants/messages';
import type { PlaceCardMetadata } from '@/entities/chat-message';
import type { SearchResult } from '@/shared/lib/search';
import { apiPost } from '@/shared/api/httpClient';

export function usePlaceSearch() {
  const { addAssistantMessage } = useChatMessages();

  const searchPlace = useCallback(
    async (query: string) => {
      try {
        const result = await apiPost<SearchResult>('/api/place/search', { query });

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

import type { ConversationState, StepHandlerResult } from '../../model/types';
import { MESSAGES } from '../../constants/messages';

export function handlePlaceConfirmed(
  confirmed: boolean,
  placeName: string,
  placeAddress: string,
  _state: ConversationState,
  category?: string,
): StepHandlerResult {
  if (!confirmed) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.infoGathering.restaurant.placeNotFound,
        },
      ],
      actions: [],
      sideEffect: { type: 'none' },
    };
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.infoGathering.restaurant.placeConfirmed(
          placeName,
          category,
        ),
      },
    ],
    actions: [
      {
        type: 'UPDATE_COLLECTED_INFO',
        payload: {
          name: placeName,
          location: placeAddress,
        },
      },
    ],
    sideEffect: { type: 'none' },
  };
}

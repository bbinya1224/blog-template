import type { ConversationState } from '../../model/types';
import type { ReviewPayload } from '@/shared/types/review';
import {
  MESSAGES,
  CHOICE_OPTIONS,
  getCompanionLabel,
  getDateLabel,
} from '../../constants/messages';
import {
  extractDateInfo,
  extractCompanionInfo,
  determineInfoSubStep,
} from '../conversation-engine';
import { restaurantConfig } from '../categories/restaurant.config';
import type { StepHandlerResult } from './onboarding';

export interface InfoGatheringResult extends StepHandlerResult {
  placeSearchQuery?: string;
}

export function handleInfoGathering(
  userInput: string,
  state: ConversationState
): InfoGatheringResult {
  const subStep = state.subStep || determineInfoSubStep(state);

  switch (subStep) {
    case 'date':
      return handleDateInput(userInput, state);
    case 'companion':
      return handleCompanionInput(userInput, state);
    case 'place':
      return handlePlaceInput(userInput, state);
    case 'menu':
      return handleMenuInput(userInput, state);
    case 'taste':
      return handleTasteInput(userInput, state);
    case 'atmosphere':
      return handleAtmosphereInput(userInput, state);
    case 'highlight':
      return handleHighlightInput(userInput, state);
    default:
      return handleDateInput(userInput, state);
  }
}

function handleDateInput(
  userInput: string,
  _state: ConversationState
): InfoGatheringResult {
  const dateLabel = getDateLabel(userInput) || userInput;
  const dateValue = extractDateInfo(dateLabel);

  return {
    messages: [
      {
        role: 'assistant',
        type: 'choice',
        content: MESSAGES.infoGathering.restaurant.companion(dateLabel),
        options: CHOICE_OPTIONS.companion,
      },
    ],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload: { date: dateValue } },
      { type: 'SET_SUB_STEP', payload: 'companion' },
    ],
  };
}

function handleCompanionInput(
  userInput: string,
  _state: ConversationState
): InfoGatheringResult {
  const companionLabel = getCompanionLabel(userInput) || userInput;
  const companionValue = extractCompanionInfo(companionLabel);

  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.infoGathering.restaurant.place(companionLabel),
      },
    ],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload: { companion: companionValue } },
      { type: 'SET_SUB_STEP', payload: 'place' },
    ],
  };
}

function handlePlaceInput(
  userInput: string,
  _state: ConversationState
): InfoGatheringResult {
  return {
    messages: [
      {
        role: 'assistant',
        type: 'loading',
        content: '매장을 찾아보고 있어요... 🔍',
      },
    ],
    actions: [],
    placeSearchQuery: userInput,
  };
}

export function handlePlaceConfirmed(
  confirmed: boolean,
  placeName: string,
  placeAddress: string,
  _state: ConversationState
): InfoGatheringResult {
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
    };
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.infoGathering.restaurant.placeConfirmed(placeName),
      },
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.infoGathering.restaurant.menu,
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
      { type: 'SET_SUB_STEP', payload: 'menu' },
    ],
  };
}

function handleMenuInput(
  userInput: string,
  _state: ConversationState
): InfoGatheringResult {
  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.infoGathering.restaurant.taste,
      },
    ],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload: { menu: userInput } },
      { type: 'SET_SUB_STEP', payload: 'taste' },
    ],
  };
}

function handleTasteInput(
  userInput: string,
  _state: ConversationState
): InfoGatheringResult {
  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.infoGathering.restaurant.atmosphere,
      },
    ],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload: { pros: userInput } },
      { type: 'SET_SUB_STEP', payload: 'atmosphere' },
    ],
  };
}

function handleAtmosphereInput(
  userInput: string,
  state: ConversationState
): InfoGatheringResult {
  const currentExtra = state.collectedInfo.extra || '';
  const extraValue = currentExtra
    ? `${currentExtra}\n분위기: ${userInput}`
    : `분위기: ${userInput}`;

  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.infoGathering.restaurant.highlight,
      },
    ],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload: { extra: extraValue } },
      { type: 'SET_SUB_STEP', payload: 'highlight' },
    ],
  };
}

function handleHighlightInput(
  userInput: string,
  state: ConversationState
): InfoGatheringResult {
  const { positive, negative } = restaurantConfig.experienceKeywords!;

  const hasPositive = positive.some((k) => userInput.includes(k));
  const hasNegative = negative.some((k) => userInput.includes(k));

  const payload: Partial<ReviewPayload> = {};

  if (hasPositive) {
    const current = state.collectedInfo.pros || '';
    payload.pros = current ? `${current}\n${userInput}` : userInput;
  }
  if (hasNegative) {
    const current = state.collectedInfo.cons || '';
    payload.cons = current ? `${current}\n${userInput}` : userInput;
  }
  if (!hasPositive && !hasNegative) {
    const currentExtra = state.collectedInfo.extra || '';
    payload.extra = currentExtra
      ? `${currentExtra}\n하이라이트: ${userInput}`
      : `하이라이트: ${userInput}`;
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: '좋아요, 거의 다 됐어요! 정리해볼게요.',
      },
    ],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload },
      { type: 'GO_TO_STEP', payload: 'confirmation' },
    ],
    nextStep: 'confirmation',
  };
}

import type { ConversationState, StepHandlerResult, UserInput } from '../../model/types';
import type { ReviewPayload } from '@/shared/types/review';
import { MESSAGES } from '../../constants/messages';
import { CHOICE_OPTIONS, getCompanionLabel, getDateLabel } from '../../constants/choiceOptions';
import {
  extractDateInfo,
  extractCompanionInfo,
  determineInfoSubStep,
} from '../conversation/conversationEngine';
import { restaurantConfig } from '../categories/restaurant.config';

export function handleInfoGathering(
  input: UserInput,
  state: ConversationState,
): StepHandlerResult {
  const subStep = state.subStep || determineInfoSubStep(state);
  const dateCompanionValue = input.optionId || input.text;

  switch (subStep) {
    case 'date':
      return handleDateInput(dateCompanionValue, state);
    case 'companion':
      return handleCompanionInput(dateCompanionValue, state);
    case 'place':
      return handlePlaceInput(input.text, state);
    case 'menu':
      return handleMenuInput(input.text, state);
    case 'taste':
      return handleTasteInput(input.text, state);
    case 'atmosphere':
      return handleAtmosphereInput(input.text, state);
    case 'highlight':
      return handleHighlightInput(input.text, state);
    default:
      return handleDateInput(dateCompanionValue, state);
  }
}

function handleDateInput(
  userInput: string,
  _state: ConversationState,
): StepHandlerResult {
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
    sideEffect: { type: 'none' },
  };
}

function handleCompanionInput(
  userInput: string,
  _state: ConversationState,
): StepHandlerResult {
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
    sideEffect: { type: 'none' },
  };
}

function handlePlaceInput(
  userInput: string,
  _state: ConversationState,
): StepHandlerResult {
  return {
    messages: [
      {
        role: 'assistant',
        type: 'loading',
        content: '매장을 찾아보고 있어요... 🔍',
      },
    ],
    actions: [],
    sideEffect: { type: 'place-search', query: userInput },
  };
}

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
      { type: 'SET_SUB_STEP', payload: 'menu' },
    ],
    sideEffect: { type: 'none' },
  };
}

function handleMenuInput(
  userInput: string,
  _state: ConversationState,
): StepHandlerResult {
  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.infoGathering.restaurant.taste(userInput),
      },
    ],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload: { menu: userInput } },
      { type: 'SET_SUB_STEP', payload: 'taste' },
    ],
    sideEffect: { type: 'none' },
  };
}

function handleTasteInput(
  userInput: string,
  _state: ConversationState,
): StepHandlerResult {
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
    sideEffect: { type: 'none' },
  };
}

function handleAtmosphereInput(
  userInput: string,
  state: ConversationState,
): StepHandlerResult {
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
    sideEffect: { type: 'none' },
  };
}

function handleHighlightInput(
  userInput: string,
  state: ConversationState,
): StepHandlerResult {
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
    messages: [],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload },
      { type: 'GO_TO_STEP', payload: 'smart-followup' },
    ],
    sideEffect: { type: 'none' },
  };
}

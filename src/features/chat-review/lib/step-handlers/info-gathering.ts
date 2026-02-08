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
    case 'experience':
      return handleExperienceInput(userInput, state);
    case 'additional':
      return handleAdditionalInput(userInput, state);
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
        content: MESSAGES.infoGathering.restaurant.experience,
      },
    ],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload: { menu: userInput } },
      { type: 'SET_SUB_STEP', payload: 'experience' },
    ],
  };
}

function handleExperienceInput(
  userInput: string,
  _state: ConversationState
): InfoGatheringResult {
  const positiveKeywords = [
    '맛있',
    '좋',
    '최고',
    '친절',
    '깔끔',
    '분위기',
    '예쁜',
    '싱싱',
    '쫄깃',
  ];
  const negativeKeywords = [
    '아쉬',
    '별로',
    '실망',
    '비싸',
    '느린',
    '불친절',
    '기다',
  ];

  let hasPositive = false;
  let hasNegative = false;

  positiveKeywords.forEach((keyword) => {
    if (userInput.includes(keyword)) {
      hasPositive = true;
    }
  });

  negativeKeywords.forEach((keyword) => {
    if (userInput.includes(keyword)) {
      hasNegative = true;
    }
  });

  const payload: Partial<ReviewPayload> = {};
  if (hasPositive && !hasNegative) {
    payload.pros = userInput;
  } else if (hasNegative && !hasPositive) {
    payload.cons = userInput;
  } else {
    payload.extra = userInput;
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'choice',
        content: MESSAGES.infoGathering.restaurant.additional,
        options: CHOICE_OPTIONS.additionalInfo,
      },
    ],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload },
      { type: 'SET_SUB_STEP', payload: 'additional' },
    ],
  };
}

function handleAdditionalInput(
  userInput: string,
  state: ConversationState
): InfoGatheringResult {
  const lowered = userInput.toLowerCase();

  if (lowered === 'done' || lowered.includes('됐') || lowered.includes('충분')) {
    return {
      messages: [],
      actions: [{ type: 'GO_TO_STEP', payload: 'confirmation' }],
      nextStep: 'confirmation',
    };
  }

  if (
    lowered === 'waiting' ||
    lowered.includes('웨이팅') ||
    lowered.includes('기다')
  ) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'choice',
          content: MESSAGES.infoGathering.restaurant.waitingTime,
          options: CHOICE_OPTIONS.waitingTime,
        },
      ],
      actions: [],
    };
  }

  if (lowered === 'price' || lowered.includes('가격')) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'choice',
          content: MESSAGES.infoGathering.restaurant.price,
          options: CHOICE_OPTIONS.priceRange,
        },
      ],
      actions: [],
    };
  }

  if (lowered === 'other-menu' || lowered.includes('다른 메뉴')) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.infoGathering.restaurant.otherMenu,
        },
      ],
      actions: [],
    };
  }

  const currentExtra = state.collectedInfo.extra || '';
  return {
    messages: [
      {
        role: 'assistant',
        type: 'choice',
        content: '더 알려주실 내용이 있나요? 😊',
        options: CHOICE_OPTIONS.additionalInfo,
      },
    ],
    actions: [
      {
        type: 'UPDATE_COLLECTED_INFO',
        payload: { extra: `${currentExtra} ${userInput}`.trim() },
      },
    ],
  };
}

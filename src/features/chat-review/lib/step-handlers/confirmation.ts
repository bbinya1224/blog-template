import type { ChatMessage } from '@/entities/chat-message';
import type {
  ConversationState,
  RestaurantInfoStep,
  StepHandlerResult,
  UserInput,
} from '../../model/types';
import { MESSAGES } from '../../constants/messages';
import { CHOICE_OPTIONS } from '../../constants/choiceOptions';
import { classifyIntent } from '../conversation/conversationEngine';

export function handleConfirmation(
  input: UserInput,
  _state: ConversationState,
): StepHandlerResult {
  if (input.optionId === 'yes') {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.confirmation.correct,
        },
        {
          role: 'assistant',
          type: 'loading',
          content: MESSAGES.generating.working,
        },
      ],
      actions: [{ type: 'GO_TO_STEP', payload: 'generating' }],
      sideEffect: { type: 'none' },
    };
  }
  if (input.optionId === 'no') {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.confirmation.needsEdit,
        },
      ],
      actions: [],
      sideEffect: { type: 'none' },
    };
  }

  const intent = classifyIntent(input.text);

  if (intent === 'confirm_yes') {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.confirmation.correct,
        },
        {
          role: 'assistant',
          type: 'loading',
          content: MESSAGES.generating.working,
        },
      ],
      actions: [{ type: 'GO_TO_STEP', payload: 'generating' }],
      sideEffect: { type: 'none' },
    };
  }

  const lowered = input.text.toLowerCase();

  const fieldKeywords: Record<string, RestaurantInfoStep> = {
    날짜: 'date',
    언제: 'date',
    누구: 'companion',
    동행: 'companion',
    장소: 'place',
    매장: 'place',
    어디: 'place',
    메뉴: 'menu',
    음식: 'menu',
    맛: 'taste',
    분위기: 'atmosphere',
  };

  for (const [keyword, subStep] of Object.entries(fieldKeywords)) {
    if (lowered.includes(keyword)) {
      return {
        messages: [
          {
            role: 'assistant',
            type: 'text',
            content: `${keyword} 부분을 수정할게요! 다시 알려주세요 😊`,
          },
        ],
        actions: [
          { type: 'GO_TO_STEP', payload: 'info-gathering' },
          { type: 'SET_SUB_STEP', payload: subStep },
        ],
        sideEffect: { type: 'none' },
      };
    }
  }

  if (intent === 'confirm_no' || intent === 'modify_previous') {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.confirmation.needsEdit,
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
        type: 'choice',
        content: '내용이 맞는지 확인해주세요! 😊',
        options: CHOICE_OPTIONS.confirmInfo,
      },
    ],
    actions: [],
    sideEffect: { type: 'none' },
  };
}

export function createSummaryMessage(state: ConversationState): ChatMessage {
  const info = state.collectedInfo;

  const summaryLines = [
    `📍 ${info.name || '매장명 미입력'} (${info.location || '위치 미입력'})`,
    `📅 ${info.date || '날짜 미입력'}`,
    `👥 ${info.companion || '동행인 미입력'}`,
    `🍽️ ${info.menu || '메뉴 미입력'}`,
  ];

  if (info.pros) {
    summaryLines.push(`\n✨ 좋았던 점`);
    summaryLines.push(`• ${info.pros}`);
  }

  if (info.cons) {
    summaryLines.push(`\n😅 아쉬웠던 점`);
    summaryLines.push(`• ${info.cons}`);
  }

  if (info.extra) {
    summaryLines.push(`\n📝 기타`);
    summaryLines.push(`• ${info.extra}`);
  }

  return {
    id: `summary_${Date.now()}`,
    timestamp: new Date(),
    role: 'assistant',
    type: 'summary',
    content: MESSAGES.confirmation.summary,
    metadata: {
      formattedSummary: summaryLines.join('\n'),
      ...info,
    },
  };
}

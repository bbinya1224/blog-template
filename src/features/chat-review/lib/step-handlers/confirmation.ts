import type { ChatMessage } from '@/entities/chat-message';
import type { ConversationState, RestaurantInfoStep } from '../../model/types';
import { MESSAGES, CHOICE_OPTIONS } from '../../constants/messages';
import type { StepHandlerResult } from '.';

export function handleConfirmation(
  userInput: string,
  _state: ConversationState
): StepHandlerResult {
  const lowered = userInput.toLowerCase();

  if (
    lowered === 'yes' ||
    lowered.includes('네') ||
    lowered.includes('맞아') ||
    lowered.includes('ㅇㅇ')
  ) {
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
      nextStep: 'generating',
    };
  }

  if (
    lowered === 'no' ||
    lowered.includes('수정') ||
    lowered.includes('아니') ||
    lowered.includes('틀')
  ) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.confirmation.needsEdit,
        },
      ],
      actions: [],
    };
  }

  const fieldKeywords: Record<string, RestaurantInfoStep> = {
    '날짜': 'date',
    '언제': 'date',
    '누구': 'companion',
    '동행': 'companion',
    '장소': 'place',
    '매장': 'place',
    '어디': 'place',
    '메뉴': 'menu',
    '음식': 'menu',
    '맛': 'taste',
    '분위기': 'atmosphere',
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
        nextStep: 'info-gathering',
      };
    }
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
  };
}

export function createSummaryMessage(
  state: ConversationState
): Omit<ChatMessage, 'id' | 'timestamp'> {
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
    role: 'assistant',
    type: 'summary',
    content: MESSAGES.confirmation.summary,
    metadata: {
      formattedSummary: summaryLines.join('\n'),
      ...info,
    },
  };
}

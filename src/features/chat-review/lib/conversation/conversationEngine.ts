import type {
  ConversationStep,
  ConversationState,
  RestaurantInfoStep,
  stepTransitions,
} from '../../model/types';
import type { ChatMessage } from '@/entities/chat-message';
import type { StyleProfile } from '@/entities/style-profile';
import { MESSAGES } from '../../constants/messages';
import { CHOICE_OPTIONS } from '../../constants/choiceOptions';

export function canTransition(
  currentStep: ConversationStep,
  targetStep: ConversationStep,
  transitions: typeof stepTransitions
): boolean {
  const allowed = transitions[currentStep];
  return allowed?.includes(targetStep) ?? false;
}

export function determineNextStep(state: ConversationState): ConversationStep {
  switch (state.step) {
    case 'style-check':
      return state.hasExistingStyle ? 'topic-select' : 'style-setup';

    case 'style-setup':
      return state.styleProfile ? 'topic-select' : 'style-setup';

    case 'topic-select':
      return state.selectedTopic ? 'info-gathering' : 'topic-select';

    case 'info-gathering':
      return isInfoGatheringComplete(state) ? 'smart-followup' : 'info-gathering';

    case 'smart-followup':
      return 'confirmation';

    case 'confirmation':
      return 'generating';

    case 'generating':
      return state.generatedReview ? 'review-edit' : 'generating';

    case 'review-edit':
      return 'complete';

    default:
      return state.step;
  }
}

export function isInfoGatheringComplete(state: ConversationState): boolean {
  const info = state.collectedInfo;
  return !!(
    info.date &&
    info.companion &&
    info.location &&
    info.menu &&
    info.pros
  );
}

export function determineInfoSubStep(
  state: ConversationState
): RestaurantInfoStep {
  const info = state.collectedInfo;

  if (!info.date) return 'date';
  if (!info.companion) return 'companion';
  if (!info.location || !info.name) return 'place';
  if (!info.menu) return 'menu';
  if (!info.pros) return 'taste';
  if (!info.extra) return 'atmosphere';
  return 'highlight';
}

export type UserIntent =
  | 'answer'           // 질문에 대한 답변
  | 'modify_previous'  // 이전 답변 수정
  | 'skip'             // 건너뛰기
  | 'help'             // 도움 요청
  | 'restart'          // 처음부터 다시
  | 'confirm_yes'      // 확인 - 예
  | 'confirm_no'       // 확인 - 아니오
  | 'unclear';         // 불명확

export function classifyIntent(input: string): UserIntent {
  const lowered = input.toLowerCase().trim();

  // 확인 패턴
  if (/^(네|예|응|좋아|확인|맞아|그래|ㅇㅇ|ok|yes|완벽|됐어(?!요)|완성)/.test(lowered)) {
    return 'confirm_yes';
  }
  if (/^(아니|아뇨|노|no|다시|수정|틀려|틀렸)/.test(lowered)) {
    return 'confirm_no';
  }

  // 건너뛰기
  if (/^(건너뛰|스킵|skip|패스|pass|없어|몰라|충분|됐어요|그만)/.test(lowered)) {
    return 'skip';
  }

  // 도움 요청
  if (/^(도움|help|뭐|어떻게|모르겠)/.test(lowered)) {
    return 'help';
  }

  // 처음부터
  if (/^(처음|시작|리셋|reset|다시 시작)/.test(lowered)) {
    return 'restart';
  }

  // 수정 요청
  if (/수정|바꿔|변경|고쳐/.test(lowered)) {
    return 'modify_previous';
  }

  // 기본: 답변으로 간주
  return 'answer';
}

export function createInitialMessage(
  step: ConversationStep,
  state: ConversationState
): ChatMessage {
  const timestamp = new Date();
  const baseMessage = {
    id: `init_${step}_${Date.now()}`,
    role: 'assistant' as const,
    timestamp,
  };

  switch (step) {
    case 'style-check':
      if (state.hasExistingStyle && state.styleProfile) {
        return {
          ...baseMessage,
          type: 'style-summary',
          content: MESSAGES.styleCheck.hasStyle(state.userName || ''),
          metadata: formatStyleSummary(state.styleProfile),
          options: CHOICE_OPTIONS.styleConfirm,
        };
      }
      return {
        ...baseMessage,
        type: 'choice',
        content: MESSAGES.styleCheck.noStyle(state.userName || ''),
        options: CHOICE_OPTIONS.styleSetupMethod,
      };

    case 'topic-select':
      return {
        ...baseMessage,
        type: 'choice',
        content: MESSAGES.topicSelect.ask,
        options: CHOICE_OPTIONS.topics,
      };

    case 'conversation':
      return {
        ...baseMessage,
        type: 'text',
        content: MESSAGES.conversation.greeting,
      };

    case 'smart-followup':
      return {
        ...baseMessage,
        type: 'loading',
        content: MESSAGES.smartFollowup.loading,
      };

    case 'confirmation':
      return {
        ...baseMessage,
        type: 'summary',
        content: MESSAGES.confirmation.summary,
        metadata: state.collectedInfo,
        options: CHOICE_OPTIONS.confirmInfo,
      };

    case 'generating':
      return {
        ...baseMessage,
        type: 'loading',
        content: MESSAGES.generating.working,
      };

    case 'review-edit':
      return {
        ...baseMessage,
        type: 'review-preview',
        content: MESSAGES.reviewEdit.complete,
        metadata: {
          review: state.generatedReview || '',
          characterCount: state.generatedReview?.length || 0,
        },
      };

    case 'complete':
      return {
        ...baseMessage,
        type: 'text',
        content: MESSAGES.complete.thanks(state.userName || ''),
      };

    default:
      return {
        ...baseMessage,
        type: 'text',
        content: '',
      };
  }
}

function createInfoGatheringMessage(
  subStep: RestaurantInfoStep,
  menu?: string
): ChatMessage {
  const timestamp = new Date();
  const baseMessage = {
    id: `info_${subStep}_${Date.now()}`,
    role: 'assistant' as const,
    timestamp,
  };

  switch (subStep) {
    case 'date':
      return {
        ...baseMessage,
        type: 'choice',
        content: MESSAGES.infoGathering.restaurant.date,
        options: CHOICE_OPTIONS.visitDate,
      };

    case 'companion':
      return {
        ...baseMessage,
        type: 'choice',
        content: '누구랑 같이 가셨어요? 👀',
        options: CHOICE_OPTIONS.companion,
      };

    case 'place':
      return {
        ...baseMessage,
        type: 'input',
        content: '어느 매장에서 어떤 음식을 드셨어요?\n더 알려주세요! 🍴',
      };

    case 'menu':
      return {
        ...baseMessage,
        type: 'input',
        content: MESSAGES.infoGathering.restaurant.menu,
      };

    case 'taste':
      return {
        ...baseMessage,
        type: 'input',
        content: MESSAGES.infoGathering.restaurant.taste(menu),
      };

    case 'atmosphere':
      return {
        ...baseMessage,
        type: 'input',
        content: MESSAGES.infoGathering.restaurant.atmosphere,
      };

    case 'highlight':
      return {
        ...baseMessage,
        type: 'input',
        content: MESSAGES.infoGathering.restaurant.highlight,
      };

    default:
      return {
        ...baseMessage,
        type: 'text',
        content: '',
      };
  }
}

function formatStyleSummary(profile: StyleProfile): Record<string, unknown> {
  return {
    writingStyle: profile.writing_style?.tone || '친근한 톤',
    emojiUsage: profile.writing_style?.emoji_usage || '적당히 사용',
    sentenceLength: profile.visual_structure?.paragraph_pattern || '보통',
    tone: profile.writing_style?.formality || '존댓말',
    frequentExpressions: profile.keyword_profile?.frequent_words?.slice(0, 5) || [],
  };
}

export function extractDateInfo(input: string): string {
  const today = new Date();
  const lowered = input.toLowerCase();

  if (lowered.includes('오늘')) {
    return today.toISOString().split('T')[0];
  }
  if (lowered.includes('어제')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
  if (lowered.includes('이번 주') || lowered.includes('이번주')) {
    return '이번 주';
  }

  // 날짜 패턴 매칭 (예: 2월 3일, 2/3, 02-03)
  const datePattern = /(\d{1,2})[월\/\-](\d{1,2})/;
  const match = input.match(datePattern);
  if (match) {
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    return `${today.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return input;
}

export function extractCompanionInfo(input: string): string {
  const lowered = input.toLowerCase();

  if (lowered.includes('혼자') || lowered.includes('혼밥')) return '혼자';
  if (lowered.includes('친구')) return '친구';
  if (lowered.includes('가족') || lowered.includes('부모') || lowered.includes('엄마') || lowered.includes('아빠')) return '가족';
  if (lowered.includes('연인') || lowered.includes('애인') || lowered.includes('남친') || lowered.includes('여친')) return '연인';
  if (lowered.includes('동료') || lowered.includes('회사') || lowered.includes('직장')) return '직장 동료';

  return input;
}

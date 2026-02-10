import type { ConversationState } from '../../model/types';
import type { ReviewPayload } from '@/shared/types/review';
import { CHOICE_OPTIONS } from '../../constants/messages';
import type { StepHandlerResult } from './onboarding';

export interface SmartFollowupResult extends StepHandlerResult {
  skipFollowup?: boolean;
}

export function handleSmartFollowup(
  userInput: string,
  state: ConversationState,
  remainingQuestions: string[]
): SmartFollowupResult {
  const lowered = userInput.toLowerCase();

  // 스킵 처리
  if (
    lowered.includes('충분') ||
    lowered.includes('스킵') ||
    lowered.includes('skip') ||
    lowered.includes('리뷰 작성')
  ) {
    return {
      messages: [],
      actions: [{ type: 'GO_TO_STEP', payload: 'confirmation' }],
      nextStep: 'confirmation',
      skipFollowup: true,
    };
  }

  // 답변을 extra에 누적
  const currentExtra = state.collectedInfo.extra || '';
  const payload: Partial<ReviewPayload> = {
    extra: currentExtra ? `${currentExtra}\n${userInput}` : userInput,
  };

  // 다음 질문이 있으면 표시
  if (remainingQuestions.length > 0) {
    const nextQuestion = remainingQuestions[0];
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: nextQuestion,
          options: CHOICE_OPTIONS.smartFollowupSkip,
        },
      ],
      actions: [{ type: 'UPDATE_COLLECTED_INFO', payload }],
    };
  }

  // 모든 질문 완료 → confirmation으로 이동
  return {
    messages: [],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload },
      { type: 'GO_TO_STEP', payload: 'confirmation' },
    ],
    nextStep: 'confirmation',
  };
}

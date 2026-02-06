/**
 * Review Edit Step Handler
 * 리뷰 수정 단계 처리
 */

import type { ConversationState } from '../../model/types';
import { MESSAGES, CHOICE_OPTIONS } from '../../constants/messages';
import type { StepHandlerResult } from './onboarding';

export interface ReviewEditResult extends StepHandlerResult {
  editRequest?: string; // 수정 요청이 있는 경우
}

export function handleReviewEdit(
  userInput: string,
  state: ConversationState
): ReviewEditResult {
  const lowered = userInput.toLowerCase();

  // 완료
  if (
    lowered === 'complete' ||
    lowered.includes('완벽') ||
    lowered.includes('좋아') ||
    lowered.includes('됐어')
  ) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.complete.thanks(state.userName || ''),
        },
      ],
      actions: [{ type: 'GO_TO_STEP', payload: 'complete' }],
      nextStep: 'complete',
    };
  }

  // 수정 요청
  if (lowered === 'edit' || lowered.includes('수정')) {
    // "수정해주세요"만 입력한 경우 - 구체적인 요청 받기
    if (userInput.length < 10) {
      return {
        messages: [
          {
            role: 'assistant',
            type: 'text',
            content: MESSAGES.reviewEdit.askEdit,
          },
        ],
        actions: [],
      };
    }
  }

  // 구체적인 수정 요청 (길이가 충분하면)
  if (userInput.length >= 5) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'loading',
          content: MESSAGES.reviewEdit.editing,
        },
      ],
      actions: [],
      editRequest: userInput,
    };
  }

  // 불명확한 경우
  return {
    messages: [
      {
        role: 'assistant',
        type: 'choice',
        content: '이 리뷰로 진행할까요? 😊',
        options: CHOICE_OPTIONS.reviewComplete,
      },
    ],
    actions: [],
  };
}

/**
 * 수정 완료 후 호출
 */
export function handleReviewEdited(
  editedReview: string,
  _state: ConversationState
): StepHandlerResult {
  return {
    messages: [
      {
        role: 'assistant',
        type: 'review-preview',
        content: MESSAGES.reviewEdit.edited,
        metadata: {
          review: editedReview,
          characterCount: editedReview.length,
        },
      },
    ],
    actions: [{ type: 'SET_GENERATED_REVIEW', payload: editedReview }],
  };
}

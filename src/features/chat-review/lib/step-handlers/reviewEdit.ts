import type {
  ConversationState,
  StepHandlerResult,
  ReviewEditResult,
} from '../../model/types';
import { MESSAGES, CHOICE_OPTIONS } from '../../constants/messages';

export function handleReviewEdit(
  userInput: string,
  state: ConversationState,
): ReviewEditResult {
  const lowered = userInput.toLowerCase();

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

  if (lowered === 'edit' || lowered.includes('수정')) {
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

export function handleReviewEdited(editedReview: string): StepHandlerResult {
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

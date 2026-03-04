import type {
  ConversationState,
  StepHandlerResult,
  UserInput,
} from '../../model/types';
import { MESSAGES } from '../../constants/messages';
import { CHOICE_OPTIONS } from '../../constants/choiceOptions';
import { classifyIntent } from '../conversation/conversationEngine';

export function handleReviewEdit(
  input: UserInput,
  state: ConversationState,
): StepHandlerResult {
  if (input.optionId === 'complete') {
    return { messages: [{ role: 'assistant', type: 'text', content: MESSAGES.complete.thanks(state.userName || '') }], actions: [{ type: 'GO_TO_STEP', payload: 'complete' }], sideEffect: { type: 'none' } };
  }
  if (input.optionId === 'edit') {
    return { messages: [{ role: 'assistant', type: 'text', content: MESSAGES.reviewEdit.askEdit }], actions: [], sideEffect: { type: 'none' } };
  }

  const intent = classifyIntent(input.text);

  if (intent === 'confirm_yes') {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.complete.thanks(state.userName || ''),
        },
      ],
      actions: [{ type: 'GO_TO_STEP', payload: 'complete' }],
      sideEffect: { type: 'none' },
    };
  }

  if (intent === 'confirm_no' || intent === 'modify_previous') {
    if (input.text.length < 10) {
      return {
        messages: [
          {
            role: 'assistant',
            type: 'text',
            content: MESSAGES.reviewEdit.askEdit,
          },
        ],
        actions: [],
        sideEffect: { type: 'none' },
      };
    }
  }

  if (input.text.length >= 5) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'loading',
          content: MESSAGES.reviewEdit.editing,
        },
      ],
      actions: [],
      sideEffect: { type: 'edit-review', request: input.text },
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
    sideEffect: { type: 'none' },
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
    sideEffect: { type: 'none' },
  };
}

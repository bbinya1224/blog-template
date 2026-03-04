import type { ConversationState, StepHandlerResult, UserInput } from '../../model/types';
import type { ReviewPayload } from '@/shared/types/review';
import { CHOICE_OPTIONS } from '../../constants/choiceOptions';
import { classifyIntent } from '../conversation/conversationEngine';

export function handleSmartFollowup(
  input: UserInput,
  state: ConversationState,
  remainingQuestions: string[],
): StepHandlerResult {
  if (input.optionId === 'skip') {
    return { messages: [], actions: [{ type: 'GO_TO_STEP', payload: 'confirmation' }], sideEffect: { type: 'skip-followup' } };
  }

  const intent = classifyIntent(input.text);

  if (intent === 'skip') {
    return {
      messages: [],
      actions: [{ type: 'GO_TO_STEP', payload: 'confirmation' }],
      sideEffect: { type: 'skip-followup' },
    };
  }

  const currentExtra = state.collectedInfo.extra || '';
  const payload: Partial<ReviewPayload> = {
    extra: currentExtra ? `${currentExtra}\n${input.text}` : input.text,
  };

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
      sideEffect: { type: 'none' },
    };
  }

  return {
    messages: [],
    actions: [
      { type: 'UPDATE_COLLECTED_INFO', payload },
      { type: 'GO_TO_STEP', payload: 'confirmation' },
    ],
    sideEffect: { type: 'none' },
  };
}

import type { StepHandlerResult, UserInput } from '../../model/types';
import type { FlowInputContext } from '../../model/flow';
import { MESSAGES } from '../../constants/messages';

export function handleConversation(
  input: UserInput,
  _ctx: FlowInputContext,
): StepHandlerResult {
  if (input.optionId === 'generate') {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.conversation.generating,
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

  return {
    messages: [
      {
        role: 'assistant',
        type: 'loading',
        content: MESSAGES.conversation.thinking,
      },
    ],
    actions: [],
    sideEffect: { type: 'parse-conversation', userMessage: input.text },
  };
}

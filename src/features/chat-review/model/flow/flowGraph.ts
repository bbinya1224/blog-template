import type { ChatMessage } from '@/entities/chat-message';
import type { ChoiceOption } from '@/entities/chat-message';
import type { FlowGraph } from './types';
import { createInitialMessage } from '../../lib/conversation/conversationEngine';
import {
  handleStyleCheck,
  handleStyleSetup,
  handleTopicSelect,
  handleInfoGathering,
  handleSmartFollowup,
  handleConfirmation,
  handleReviewEdit,
  createSummaryMessage,
} from '../../lib/step-handlers';
import { MESSAGES } from '../../constants/messages';
import { CHOICE_OPTIONS } from '../../constants/choiceOptions';

type PartialMessage = Omit<ChatMessage, 'id' | 'timestamp'>;

function assistantMsg(
  type: ChatMessage['type'],
  content: string,
  options?: ChoiceOption[],
): PartialMessage {
  return { role: 'assistant', type, content, options };
}

export const FLOW_GRAPH: FlowGraph = {
  'style-check': {
    onEnter: (ctx) => {
      if (ctx.state.hasExistingStyle && ctx.state.styleProfile) {
        return { messages: [createInitialMessage('style-check', ctx.state)] };
      }
      return { messages: [] };
    },
    onInput: (input, ctx) => handleStyleCheck(input, ctx.state),
  },

  'style-setup': {
    onInput: (input, ctx) =>
      handleStyleSetup(input, ctx.state, ctx.styleSetupContext),
  },

  'topic-select': {
    onEnter: (ctx) => ({
      messages: [createInitialMessage('topic-select', ctx.state)],
    }),
    onInput: (input, ctx) => handleTopicSelect(input, ctx.state),
  },

  'info-gathering': {
    onEnter: (ctx) => {
      if (!ctx.state.subStep) {
        return {
          messages: [createInitialMessage('info-gathering', ctx.state)],
        };
      }
      return { messages: [] };
    },
    onInput: (input, ctx) => handleInfoGathering(input, ctx.state),
  },

  'smart-followup': {
    onEnter: async (ctx) => {
      const questions = await ctx.fetchSmartQuestions(
        ctx.state.collectedInfo,
        ctx.state.selectedTopic || 'restaurant',
      );
      if (questions.length > 0) {
        ctx.consumeNextQuestion();
        return {
          messages: [
            assistantMsg(
              'choice',
              `${MESSAGES.smartFollowup.intro}\n\n${questions[0]}`,
              [...CHOICE_OPTIONS.smartFollowupSkip],
            ),
          ],
        };
      }
      return {
        messages: [assistantMsg('text', MESSAGES.smartFollowup.error)],
      };
    },
    onInput: (input, ctx) => {
      const remaining = ctx.getRemainingQuestions();
      const result = handleSmartFollowup(input, ctx.state, remaining);
      if (result.sideEffect.type !== 'skip-followup' && remaining.length > 0) {
        ctx.consumeNextQuestion();
      }
      return result;
    },
  },

  confirmation: {
    onEnter: (ctx) => ({
      messages: [
        createSummaryMessage(ctx.state),
        assistantMsg('choice', MESSAGES.confirmation.ask, [
          ...CHOICE_OPTIONS.confirmInfo,
        ]),
      ],
    }),
    onInput: (input, ctx) => handleConfirmation(input, ctx.state),
  },

  generating: {
    onEnter: async (ctx) => {
      await ctx.generateReview();
      return { messages: [] };
    },
  },

  'review-edit': {
    onInput: (input, ctx) => handleReviewEdit(input, ctx.state),
  },

  complete: {},
};

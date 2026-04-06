import type { ChatMessage } from '@/entities/chat-message';
import type { ChoiceOption } from '@/entities/chat-message';
import type { FlowGraph } from './types';
import { createInitialMessage } from '../../lib/conversation/conversationEngine';
import {
  handleStyleCheck,
  handleStyleSetup,
  handleTopicSelect,
  handleConversation,
  handleReviewEdit,
} from '../../lib/step-handlers';
import { MESSAGES } from '../../constants/messages';

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
    onEnter: (ctx) => ({
      messages: [createInitialMessage('style-check', ctx.state)],
    }),
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

  conversation: {
    onEnter: () => ({
      messages: [assistantMsg('text', MESSAGES.conversation.greeting)],
    }),
    onInput: (input, ctx) => handleConversation(input, ctx),
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

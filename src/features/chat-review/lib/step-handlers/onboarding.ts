/**
 * Onboarding Step Handler
 * 온보딩 단계 처리
 */

import type { ChatMessage } from '@/entities/chat-message';
import type { ConversationState, ConversationAction } from '../../model/types';
import { MESSAGES } from '../../constants/messages';

export interface StepHandlerResult {
  messages: Omit<ChatMessage, 'id' | 'timestamp'>[];
  actions: ConversationAction[];
  nextStep?: string;
}

export function handleOnboarding(
  userInput: string,
  _state: ConversationState
): StepHandlerResult {
  const userName = userInput.trim();

  if (!userName) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: '이름을 입력해주세요! 😊',
        },
      ],
      actions: [],
    };
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.onboarding.nameReceived(userName),
      },
    ],
    actions: [
      { type: 'SET_USER_NAME', payload: userName },
      { type: 'GO_TO_STEP', payload: 'style-check' },
    ],
    nextStep: 'style-check',
  };
}

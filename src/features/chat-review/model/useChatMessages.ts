'use client';

import { useChatStore } from './store';
import type {
  ChatMessage,
  MessageType,
  ChoiceOption,
} from '@/entities/chat-message';

export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  addAssistantMessage: (
    content: string,
    type?: MessageType,
    options?: ChoiceOption[],
    metadata?: Record<string, unknown>,
  ) => string;
  addUserMessage: (content: string) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
}

export function useChatMessages(): UseChatMessagesReturn {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);
  const clearMessages = useChatStore((s) => s.clearMessages);

  return {
    messages,
    addMessage,
    addAssistantMessage,
    addUserMessage,
    updateMessage,
    removeMessage,
    clearMessages,
  };
}

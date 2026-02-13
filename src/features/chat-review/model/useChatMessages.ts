'use client';

import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { messagesAtom } from './atoms';
import type {
  ChatMessage,
  MessageType,
  ChoiceOption,
} from '@/entities/chat-message';

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

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
  const [messages, setMessages] = useAtom(messagesAtom);

  const addMessage = useCallback(
    (message: Omit<ChatMessage, 'id' | 'timestamp'>): string => {
      const id = generateId();
      const newMessage: ChatMessage = {
        ...message,
        id,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      return id;
    },
    [setMessages],
  );

  const addAssistantMessage = useCallback(
    (
      content: string,
      type: MessageType = 'text',
      options?: ChoiceOption[],
      metadata?: Record<string, unknown>,
    ): string => {
      return addMessage({
        role: 'assistant',
        type,
        content,
        options,
        metadata,
      });
    },
    [addMessage],
  );

  const addUserMessage = useCallback(
    (content: string): string => {
      return addMessage({
        role: 'user',
        type: 'text',
        content,
      });
    },
    [addMessage],
  );

  const updateMessage = useCallback(
    (id: string, updates: Partial<ChatMessage>): void => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
      );
    },
    [setMessages],
  );

  const removeMessage = useCallback(
    (id: string): void => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    },
    [setMessages],
  );

  const clearMessages = useCallback((): void => {
    setMessages([]);
  }, [setMessages]);

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

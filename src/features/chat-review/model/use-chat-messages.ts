'use client';

import { useState, useCallback } from 'react';
import type { ChatMessage, MessageType, ChoiceOption } from '@/entities/chat-message';

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  addAssistantMessage: (
    content: string,
    type?: MessageType,
    options?: ChoiceOption[],
    metadata?: Record<string, unknown>
  ) => string;
  addUserMessage: (content: string) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
}

export function useChatMessages(
  initialMessages: ChatMessage[] = []
): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

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
    []
  );

  const addAssistantMessage = useCallback(
    (
      content: string,
      type: MessageType = 'text',
      options?: ChoiceOption[],
      metadata?: Record<string, unknown>
    ): string => {
      return addMessage({
        role: 'assistant',
        type,
        content,
        options,
        metadata,
      });
    },
    [addMessage]
  );

  const addUserMessage = useCallback(
    (content: string): string => {
      return addMessage({
        role: 'user',
        type: 'text',
        content,
      });
    },
    [addMessage]
  );

  const updateMessage = useCallback(
    (id: string, updates: Partial<ChatMessage>): void => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
      );
    },
    []
  );

  const removeMessage = useCallback((id: string): void => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const clearMessages = useCallback((): void => {
    setMessages([]);
  }, []);

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

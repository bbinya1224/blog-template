'use client';

import { create } from 'zustand';
import type {
  ConversationStep,
  ConversationState,
  ConversationAction,
  RestaurantInfoStep,
  ReviewTopic,
} from './types';
import { initialConversationState } from './types';
import type { StyleProfile } from '@/entities/style-profile';
import type {
  ChatMessage,
  MessageType,
  ChoiceOption,
} from '@/entities/chat-message';
import type { ReviewPayload } from '@/shared/types/review';

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

interface ChatStore extends ConversationState {
  messages: ChatMessage[];
  isProcessing: boolean;
  savedReviewId: string | null;

  // Conversation state setters
  setStep: (step: ConversationStep) => void;
  setSubStep: (subStep: RestaurantInfoStep | undefined) => void;
  setUserName: (name: string | null) => void;
  setHasExistingStyle: (has: boolean) => void;
  setStyleProfile: (profile: StyleProfile | null) => void;
  setSelectedTopic: (topic: ReviewTopic | null) => void;
  updateCollectedInfo: (info: Partial<ReviewPayload>) => void;
  setGeneratedReview: (review: string | null) => void;
  setSessionId: (id: string | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setSavedReviewId: (id: string | null) => void;

  // Message actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  addAssistantMessage: (
    content: string,
    type?: MessageType,
    options?: ChoiceOption[],
    metadata?: Record<string, unknown>,
  ) => string;
  addUserMessage: (content: string) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setMessages: (messages: ChatMessage[]) => void;

  // Dispatch actions
  dispatchActions: (actions: ConversationAction[]) => void;

  // Reset
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  ...initialConversationState,
  messages: [],
  isProcessing: false,
  savedReviewId: null,

  // Conversation state setters
  setStep: (step) => set({ step }),
  setSubStep: (subStep) => set({ subStep }),
  setUserName: (userName) => set({ userName }),
  setHasExistingStyle: (hasExistingStyle) => set({ hasExistingStyle }),
  setStyleProfile: (styleProfile) => set({ styleProfile }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
  updateCollectedInfo: (info) =>
    set((state) => ({ collectedInfo: { ...state.collectedInfo, ...info } })),
  setGeneratedReview: (generatedReview) => set({ generatedReview }),
  setSessionId: (sessionId) => set({ sessionId }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setSavedReviewId: (savedReviewId) => set({ savedReviewId }),

  // Message actions
  addMessage: (message) => {
    const id = generateId();
    const newMessage: ChatMessage = {
      ...message,
      id,
      timestamp: new Date(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
    return id;
  },

  addAssistantMessage: (content, type = 'text', options, metadata) => {
    return get().addMessage({
      role: 'assistant',
      type,
      content,
      options,
      metadata,
    });
  },

  addUserMessage: (content) => {
    return get().addMessage({
      role: 'user',
      type: 'text',
      content,
    });
  },

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg,
      ),
    })),

  setMessages: (messages) => set({ messages }),

  // Dispatch actions — setter를 위임하여 단일 변경 경로 보장
  dispatchActions: (actions) => {
    const store = get();
    for (const action of actions) {
      switch (action.type) {
        case 'SET_STYLE_PROFILE':
          store.setStyleProfile(action.payload);
          break;
        case 'SET_HAS_EXISTING_STYLE':
          store.setHasExistingStyle(action.payload);
          break;
        case 'SET_TOPIC':
          store.setSelectedTopic(action.payload);
          break;
        case 'UPDATE_COLLECTED_INFO':
          store.updateCollectedInfo(action.payload);
          break;
        case 'SET_GENERATED_REVIEW':
          store.setGeneratedReview(action.payload);
          break;
        case 'GO_TO_STEP':
          store.setStep(action.payload);
          break;
        case 'SET_SUB_STEP':
          store.setSubStep(action.payload);
          break;
        case 'RESET':
          store.reset();
          break;
      }
    }
  },

  // Reset
  reset: () =>
    set({
      ...initialConversationState,
      messages: [],
      isProcessing: false,
      savedReviewId: null,
    }),
}));

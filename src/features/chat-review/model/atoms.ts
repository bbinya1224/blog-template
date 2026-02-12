import { atom } from 'jotai';
import type {
  ConversationStep,
  ConversationState,
  RestaurantInfoStep,
  ReviewTopic,
} from './types';
import type { StyleProfile } from '@/entities/style-profile';
import type { ChatMessage } from '@/entities/chat-message';
import type { ReviewPayload } from '@/shared/types/review';

// Conversation state atoms
export const stepAtom = atom<ConversationStep>('onboarding');
export const subStepAtom = atom<RestaurantInfoStep | undefined>(undefined);
export const userNameAtom = atom<string | null>(null);
export const hasExistingStyleAtom = atom<boolean>(false);
export const styleProfileAtom = atom<StyleProfile | null>(null);
export const selectedTopicAtom = atom<ReviewTopic | null>(null);
export const collectedInfoAtom = atom<Partial<ReviewPayload>>({});
export const generatedReviewAtom = atom<string | null>(null);
export const sessionIdAtom = atom<string | null>(null);

// Chat messages atom
export const messagesAtom = atom<ChatMessage[]>([]);

// UI state atoms
export const isProcessingAtom = atom<boolean>(false);

// Derived atom for full conversation state (for compatibility)
export const conversationStateAtom = atom<ConversationState>((get) => ({
  step: get(stepAtom),
  subStep: get(subStepAtom),
  userName: get(userNameAtom),
  hasExistingStyle: get(hasExistingStyleAtom),
  styleProfile: get(styleProfileAtom),
  selectedTopic: get(selectedTopicAtom),
  collectedInfo: get(collectedInfoAtom),
  generatedReview: get(generatedReviewAtom),
  sessionId: get(sessionIdAtom),
}));

// Action atoms (write-only)
export const addMessageAtom = atom(
  null,
  (get, set, message: ChatMessage) => {
    set(messagesAtom, [...get(messagesAtom), message]);
  }
);

export const updateCollectedInfoAtom = atom(
  null,
  (get, set, info: Partial<ReviewPayload>) => {
    set(collectedInfoAtom, { ...get(collectedInfoAtom), ...info });
  }
);

// Reset atom for starting new conversation
export const resetConversationAtom = atom(
  null,
  (_get, set) => {
    set(stepAtom, 'onboarding');
    set(subStepAtom, undefined);
    set(userNameAtom, null);
    set(selectedTopicAtom, null);
    set(collectedInfoAtom, {});
    set(generatedReviewAtom, null);
    set(sessionIdAtom, null);
    set(messagesAtom, []);
  }
);

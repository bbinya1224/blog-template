import type { StyleProfile } from '@/entities/style-profile';
import type { ReviewPayload } from '@/shared/types/review';
import type { ChatMessage } from '@/entities/chat-message';

export type ConversationStep =
  | 'style-check'
  | 'style-setup'
  | 'topic-select'
  | 'conversation'
  | 'generating'
  | 'review-edit'
  | 'complete';

export type RestaurantInfoStep =
  | 'date'
  | 'companion'
  | 'place'
  | 'menu'
  | 'taste'
  | 'atmosphere'
  | 'highlight';

export type BookInfoStep =
  | 'title'
  | 'author'
  | 'readDate'
  | 'genre'
  | 'experience'
  | 'additional';

export type ReviewTopic =
  | 'restaurant'
  | 'beauty'
  | 'product'
  | 'movie'
  | 'book'
  | 'travel';

export interface ConversationState {
  step: ConversationStep;
  subStep?: RestaurantInfoStep;
  userName: string | null;
  hasExistingStyle: boolean;
  styleProfile: StyleProfile | null;
  selectedTopic: ReviewTopic | null;
  collectedInfo: Partial<ReviewPayload>;
  generatedReview: string | null;
  sessionId: string | null;
}

export const initialConversationState: ConversationState = {
  step: 'style-check',
  subStep: undefined,
  userName: null,
  hasExistingStyle: false,
  styleProfile: null,
  selectedTopic: null,
  collectedInfo: {},
  generatedReview: null,
  sessionId: null,
};

export const stepTransitions: Record<ConversationStep, ConversationStep[]> = {
  'style-check': ['style-setup', 'topic-select'],
  'style-setup': ['topic-select'],
  'topic-select': ['conversation'],
  conversation: ['conversation', 'generating'],
  generating: ['review-edit'],
  'review-edit': ['review-edit', 'complete'],
  complete: [],
};

export type StyleSetupMethod =
  | 'blog-url'
  | 'paste-text'
  | 'questionnaire';

export interface StyleSetupContext {
  method?: StyleSetupMethod;
  blogUrl?: string;
  pastedTexts?: string[];
  questionnaireStep?: number;
}

export type SideEffect =
  | { type: 'blog-analysis'; url: string }
  | { type: 'place-search'; query: string }
  | { type: 'edit-review'; request: string }
  | { type: 'parse-conversation'; userMessage: string }
  | { type: 'none' };

export interface UserInput {
  text: string;
  optionId?: string;
}

export type ConversationAction =
  | { type: 'SET_STYLE_PROFILE'; payload: StyleProfile }
  | { type: 'SET_HAS_EXISTING_STYLE'; payload: boolean }
  | { type: 'SET_TOPIC'; payload: ReviewTopic }
  | { type: 'UPDATE_COLLECTED_INFO'; payload: Partial<ReviewPayload> }
  | { type: 'SET_GENERATED_REVIEW'; payload: string }
  | { type: 'GO_TO_STEP'; payload: ConversationStep }
  | { type: 'SET_SUB_STEP'; payload: RestaurantInfoStep }
  | { type: 'SET_STYLE_SETUP_CONTEXT'; payload: Partial<StyleSetupContext> }
  | { type: 'RESET' };

export interface StepHandlerResult {
  messages: Omit<ChatMessage, 'id' | 'timestamp'>[];
  actions: ConversationAction[];
  sideEffect: SideEffect;
}

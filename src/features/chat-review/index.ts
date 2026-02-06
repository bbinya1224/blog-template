/**
 * Feature: Chat Review
 * Public API exports
 */

// UI Components
export {
  ChatContainer,
  MessageList,
  MessageBubble,
  InputArea,
  ChoiceButtons,
  TypingIndicator,
  ProgressBar,
  PlaceCard,
  StyleSummaryCard,
  ReviewPreview,
} from './ui';

// Model (Hooks & Types)
export {
  useChatMessages,
  useStreamMessage,
  useConversation,
  type ConversationState,
  type ConversationStep,
  type ConversationAction,
  type ReviewTopic,
  type RestaurantInfoStep,
  initialConversationState,
  stepTransitions,
  type UseChatMessagesReturn,
  type UseStreamMessageReturn,
  type UseConversationReturn,
} from './model';

// API
export {
  streamChatMessage,
  buildContextFromState,
  type StreamMessageInput,
  type StreamCallbacks,
} from './api/chat-api';

// Lib - Conversation Engine
export {
  canTransition,
  determineNextStep,
  isInfoGatheringComplete,
  determineInfoSubStep,
  classifyIntent,
  createInitialMessage,
  extractDateInfo,
  extractCompanionInfo,
  type UserIntent,
} from './lib/conversation-engine';

// Lib - Step Handlers
export {
  handleOnboarding,
  handleStyleSetup,
  handleStyleCheck,
  handleTopicSelect,
  handleInfoGathering,
  handlePlaceConfirmed,
  handleConfirmation,
  handleReviewEdit,
  handleReviewEdited,
  createSummaryMessage,
  type StepHandlerResult,
  type StyleSetupContext,
  type InfoGatheringResult,
  type ReviewEditResult,
} from './lib/step-handlers';

// Constants
export {
  MESSAGES,
  CHOICE_OPTIONS,
  getCompanionLabel,
  getDateLabel,
} from './constants/messages';

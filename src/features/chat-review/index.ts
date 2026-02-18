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
  WelcomeScreen,
  ChatErrorBoundary,
} from './ui';

// Model (Hooks & Types)
export {
  type ConversationState,
  type ConversationStep,
  type ConversationAction,
  type ReviewTopic,
  type RestaurantInfoStep,
  initialConversationState,
  stepTransitions,
  useChatStore,
  type UseChatMessagesReturn,
  useChatOrchestration,
  useRecentReviews,
  useChatHandlers,
  useChatMessages,
} from './model';

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
} from './lib/conversationEngine';

// Lib - Step Handlers
export {
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

// Lib - Prompt Builder
export {
  buildReviewSystemPrompt,
  buildReviewUserPrompt,
  formatCollectedInfo,
  parseQuestions,
} from './lib/promptBuilder';

// Constants
export {
  MESSAGES,
  CHOICE_OPTIONS,
  CATEGORY_LABELS,
  getCompanionLabel,
  getDateLabel,
} from './constants/messages';

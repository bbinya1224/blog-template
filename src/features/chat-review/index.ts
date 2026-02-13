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
  type UseChatMessagesReturn,
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

// Constants
export {
  MESSAGES,
  CHOICE_OPTIONS,
  getCompanionLabel,
  getDateLabel,
} from './constants/messages';

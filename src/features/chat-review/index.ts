// UI Components
export { ChatErrorBoundary, WelcomeScreen } from './ui';

// Model (Hooks & Store)
export { useChatStore } from './model';
export { useChatHandlers } from './model';
export { FLOW_GRAPH } from './model';
export type { FlowEnterContext, FlowInputContext } from './model';

// Model - Types
export type {
  ConversationStep,
  ConversationState,
  ReviewTopic,
  UserInput,
  StepHandlerResult,
  StyleSetupContext,
} from './model';

// Lib - Prompt Builder (used by API routes)
export {
  buildReviewSystemPrompt,
  buildReviewUserPrompt,
  formatCollectedInfo,
  parseQuestions,
} from './lib/promptBuilder';

// Lib - Conversation Engine
export { createInitialMessage } from './lib/conversation/conversationEngine';

// Lib - Step Handlers
export { handleConversation } from './lib/step-handlers';

// Lib
export { formatStyleForDisplay } from './lib/formatStyleForDisplay';

// Constants
export { MESSAGES } from './constants/messages';
export { CHOICE_OPTIONS } from './constants/choiceOptions';

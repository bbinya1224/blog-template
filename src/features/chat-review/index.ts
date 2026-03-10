// UI Components
export { ChatErrorBoundary, WelcomeScreen } from './ui';

// Model (Hooks & Store)
export { useChatStore } from './model';
export { useChatHandlers } from './model';

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
export { createSummaryMessage } from './lib/step-handlers';

// Lib
export { formatStyleForDisplay } from './lib/formatStyleForDisplay';

// Constants
export { MESSAGES } from './constants/messages';
export { CHOICE_OPTIONS } from './constants/choiceOptions';

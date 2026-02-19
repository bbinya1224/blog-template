// UI Components
export { ChatContainer, ChatErrorBoundary } from './ui';

// Model (Hooks & Store)
export { useChatStore } from './model';
export { useChatOrchestration } from './model';
export { useChatHandlers } from './model';
// Types
export type { StyleSetupContext } from './lib/step-handlers';

// Lib - Prompt Builder (used by API routes)
export {
  buildReviewSystemPrompt,
  buildReviewUserPrompt,
  formatCollectedInfo,
  parseQuestions,
} from './lib/promptBuilder';

// Constants
export { MESSAGES, CHOICE_OPTIONS } from './constants/messages';

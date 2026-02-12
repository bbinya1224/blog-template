import type { ChatMessage } from '@/entities/chat-message';
import type { ConversationAction } from '../../model/types';

export interface StepHandlerResult {
  messages: Omit<ChatMessage, 'id' | 'timestamp'>[];
  actions: ConversationAction[];
  nextStep?: string;
}

export { handleStyleSetup, handleStyleCheck } from './style-setup';
export { handleTopicSelect } from './topic-select';
export {
  handleInfoGathering,
  handlePlaceConfirmed,
} from './info-gathering';
export { handleConfirmation, createSummaryMessage } from './confirmation';
export { handleSmartFollowup } from './smart-followup';
export { handleReviewEdit, handleReviewEdited } from './review-edit';

export type { StyleSetupContext } from './style-setup';
export type { InfoGatheringResult } from './info-gathering';
export type { SmartFollowupResult } from './smart-followup';
export type { ReviewEditResult } from './review-edit';

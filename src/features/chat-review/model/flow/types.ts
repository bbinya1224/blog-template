import type { ChatMessage } from '@/entities/chat-message';
import type {
  ConversationAction,
  ConversationState,
  ConversationStep,
  StepHandlerResult,
  StyleSetupContext,
  UserInput,
} from '../types';

export interface FlowEnterContext {
  state: ConversationState;
  generateReview: () => Promise<void>;
}

export interface FlowInputContext {
  state: ConversationState;
  styleSetupContext: StyleSetupContext;
}

export interface FlowEnterResult {
  messages: Omit<ChatMessage, 'id' | 'timestamp'>[];
  actions?: ConversationAction[];
}

export interface FlowNode {
  onEnter?: (ctx: FlowEnterContext) => FlowEnterResult | Promise<FlowEnterResult>;
  onInput?: (input: UserInput, ctx: FlowInputContext) => StepHandlerResult;
}

export type FlowGraph = Record<ConversationStep, FlowNode>;

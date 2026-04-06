import type { ChatMessage } from '@/entities/chat-message';
import type {
  ConversationState,
  ConversationStep,
  StepHandlerResult,
  StyleSetupContext,
  UserInput,
} from '../types';

/** onEnter 콜백에 전달되는 컨텍스트 (step 진입 시) */
export interface FlowEnterContext {
  state: ConversationState;
  generateReview: () => Promise<void>;
}

/** onInput 콜백에 전달되는 컨텍스트 (사용자 입력 시) */
export interface FlowInputContext {
  state: ConversationState;
  styleSetupContext: StyleSetupContext;
}

/** onEnter 반환 타입 — 추가할 메시지 목록 */
export interface FlowEnterResult {
  messages: Omit<ChatMessage, 'id' | 'timestamp'>[];
}

/** 각 step의 진입/입력 동작을 정의하는 노드 */
export interface FlowNode {
  onEnter?: (ctx: FlowEnterContext) => FlowEnterResult | Promise<FlowEnterResult>;
  onInput?: (input: UserInput, ctx: FlowInputContext) => StepHandlerResult;
}

export type FlowGraph = Record<ConversationStep, FlowNode>;

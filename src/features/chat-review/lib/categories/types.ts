/**
 * Category Configuration Types
 * 확장 가능한 카테고리 설정 타입 정의
 */

import type { ChoiceOption } from '@/entities/chat-message';
import type { ReviewTopic } from '../../model/types';

/**
 * 카테고리 스텝 정의
 */
export interface CategoryStep {
  id: string;
  type: 'choice' | 'input' | 'search';
  isRequired: boolean;
  field: string;
  skipLabel?: string;
}

/**
 * 카테고리 설정 인터페이스
 */
export interface CategoryConfig<TPayload, TStep extends string = string> {
  /** 카테고리 식별자 */
  id: ReviewTopic;
  /** 표시 이름 */
  name: string;
  /** 아이콘 */
  icon: string;

  /** 스텝 정의 배열 */
  steps: CategoryStep[];
  /** 스텝 순서 */
  stepOrder: TStep[];

  /** 스텝별 메시지 (문자열 또는 컨텍스트 기반 함수) */
  messages: Record<TStep, string | ((context: Partial<TPayload>) => string)>;
  /** 스텝별 선택지 옵션 */
  choiceOptions: Partial<Record<TStep, ChoiceOption[]>>;
  /** 스텝별 입력 추출 함수 */
  extractors: Partial<Record<TStep, (input: string) => string>>;

  /** 경험 키워드 (긍정/부정 분류용) */
  experienceKeywords?: {
    positive: string[];
    negative: string[];
  };

  /** 정보 수집 완료 여부 판단 */
  isComplete: (payload: Partial<TPayload>) => boolean;

  /** 스텝별 필드 매핑 (선택적) */
  stepFieldMap?: Record<TStep, keyof TPayload>;
}

/**
 * 등록된 카테고리 타입
 */
export type RegisteredCategory = CategoryConfig<unknown, string>;

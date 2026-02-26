import type { ChoiceOption } from '@/entities/chat-message';
import type { ReviewTopic } from '../../model/types';

export interface CategoryStep {
  id: string;
  type: 'choice' | 'input' | 'search';
  isRequired: boolean;
  field: string;
  skipLabel?: string;
}

export interface CategoryConfig<TPayload, TStep extends string = string> {
  id: ReviewTopic;
  name: string;
  icon: string;

  steps: CategoryStep[];
  stepOrder: TStep[];

  messages: Record<TStep, string | ((context: Partial<TPayload>) => string)>;
  choiceOptions: Partial<Record<TStep, ChoiceOption[]>>;
  extractors: Partial<Record<TStep, (input: string) => string>>;

  // 긍정/부정 분류용
  experienceKeywords?: {
    positive: string[];
    negative: string[];
  };

  isComplete: (payload: Partial<TPayload>) => boolean;
  stepFieldMap?: Record<TStep, keyof TPayload>;
}

export type RegisteredCategory = CategoryConfig<unknown, string>;

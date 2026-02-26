import type {
  ConversationState,
  ReviewTopic,
  StepHandlerResult,
} from '../../model/types';
import { MESSAGES, CHOICE_OPTIONS } from '../../constants/messages';

const TOPIC_MAP: Record<string, ReviewTopic> = {
  restaurant: 'restaurant',
  맛집: 'restaurant',
  음식: 'restaurant',
  '1': 'restaurant',
  beauty: 'beauty',
  뷰티: 'beauty',
  화장품: 'beauty',
  product: 'product',
  제품: 'product',
  movie: 'movie',
  영화: 'movie',
  book: 'book',
  책: 'book',
  travel: 'travel',
  여행: 'travel',
};

export function handleTopicSelect(
  userInput: string,
  _state: ConversationState,
): StepHandlerResult {
  const lowered = userInput.toLowerCase().trim();
  const topic = TOPIC_MAP[lowered];

  if (!topic) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'choice',
          content: '어떤 주제로 글을 쓸까요? 선택해주세요! 😊',
          options: CHOICE_OPTIONS.topics,
        },
      ],
      actions: [],
    };
  }

  if (topic !== 'restaurant') {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.topicSelect.comingSoon,
        },
        {
          role: 'assistant',
          type: 'choice',
          content: MESSAGES.topicSelect.ask,
          options: CHOICE_OPTIONS.topics,
        },
      ],
      actions: [],
    };
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.topicSelect.selected('맛집'),
      },
    ],
    actions: [
      { type: 'SET_TOPIC', payload: 'restaurant' },
      { type: 'GO_TO_STEP', payload: 'info-gathering' },
      { type: 'SET_SUB_STEP', payload: 'date' },
    ],
    nextStep: 'info-gathering',
  };
}

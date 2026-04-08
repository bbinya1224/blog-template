import type {
  ConversationState,
  ReviewTopic,
  StepHandlerResult,
  UserInput,
} from '../../model/types';
import { MESSAGES } from '../../constants/messages';
import { CHOICE_OPTIONS } from '../../constants/choiceOptions';

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
  input: UserInput,
  _state: ConversationState,
): StepHandlerResult {
  if (input.optionId) {
    const topic = TOPIC_MAP[input.optionId];
    if (topic) {
      return buildTopicResult(topic);
    }
  }

  const lowered = input.text.toLowerCase().trim();
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
      sideEffect: { type: 'none' },
    };
  }

  return buildTopicResult(topic);
}

function buildTopicResult(topic: ReviewTopic): StepHandlerResult {
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
      sideEffect: { type: 'none' },
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
      { type: 'GO_TO_STEP', payload: 'conversation' },
    ],
    sideEffect: { type: 'none' },
  };
}

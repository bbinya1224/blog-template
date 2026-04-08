import { describe, it, expect } from 'vitest';
import { handleTopicSelect } from './topicSelect';
import { initialConversationState } from '../../model/types';
import type { ConversationState } from '../../model/types';
import { MESSAGES } from '../../constants/messages';

function createState(overrides: Partial<ConversationState> = {}): ConversationState {
  return { ...initialConversationState, ...overrides };
}

describe('handleTopicSelect', () => {
  const state = createState({ step: 'topic-select' });

  describe('optionId routing', () => {
    it('restaurant → sets topic and transitions to conversation', () => {
      const result = handleTopicSelect({ text: '맛집', optionId: 'restaurant' }, state);
      expect(result.actions).toContainEqual({ type: 'SET_TOPIC', payload: 'restaurant' });
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'conversation' });
      expect(result.messages[0].content).toBe(MESSAGES.topicSelect.selected('맛집'));
    });

    it('unsupported topic (beauty) → comingSoon + re-ask', () => {
      const result = handleTopicSelect({ text: '뷰티', optionId: 'beauty' }, state);
      expect(result.messages[0].content).toBe(MESSAGES.topicSelect.comingSoon);
      expect(result.messages[1].type).toBe('choice');
      expect(result.actions).toEqual([]);
    });

    it.each(['product', 'movie', 'book', 'travel'])('unsupported topic %s → comingSoon', (topicId) => {
      const result = handleTopicSelect({ text: topicId, optionId: topicId }, state);
      expect(result.messages[0].content).toBe(MESSAGES.topicSelect.comingSoon);
    });
  });

  describe('text fallback', () => {
    it.each(['맛집', '음식', 'restaurant'])('%s → restaurant topic', (text) => {
      const result = handleTopicSelect({ text }, state);
      expect(result.actions).toContainEqual({ type: 'SET_TOPIC', payload: 'restaurant' });
    });

    it('unrecognized text → re-ask with topic choices', () => {
      const result = handleTopicSelect({ text: '뭐하지' }, state);
      expect(result.messages[0].type).toBe('choice');
      expect(result.actions).toEqual([]);
    });
  });
});

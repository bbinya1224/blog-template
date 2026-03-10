import { describe, it, expect } from 'vitest';
import { handleSmartFollowup } from './smartFollowup';
import { initialConversationState } from '../../model/types';
import type { ConversationState } from '../../model/types';

function createState(overrides: Partial<ConversationState> = {}): ConversationState {
  return { ...initialConversationState, ...overrides };
}

describe('handleSmartFollowup', () => {
  const state = createState({ step: 'smart-followup' });

  describe('optionId skip', () => {
    it('skip → confirmation step with skip-followup sideEffect', () => {
      const result = handleSmartFollowup(
        { text: '충분해요! 리뷰 작성해주세요', optionId: 'skip' },
        state,
        ['질문1', '질문2'],
      );
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'confirmation' });
      expect(result.sideEffect).toEqual({ type: 'skip-followup' });
      expect(result.messages).toEqual([]);
    });
  });

  describe('text fallback - skip keywords', () => {
    it.each(['충분해요', '스킵', 'skip', '됐어요', '그만할래'])('%s → skip-followup', (text) => {
      const result = handleSmartFollowup({ text }, state, []);
      expect(result.sideEffect).toEqual({ type: 'skip-followup' });
    });
  });

  describe('answer with remaining questions', () => {
    it('stores answer and shows next question', () => {
      const result = handleSmartFollowup(
        { text: '네 정말 맛있었어요' },
        state,
        ['다음 질문이에요'],
      );
      expect(result.actions).toContainEqual({
        type: 'UPDATE_COLLECTED_INFO',
        payload: { extra: '네 정말 맛있었어요' },
      });
      expect(result.messages[0].content).toBe('다음 질문이에요');
      expect(result.sideEffect).toEqual({ type: 'none' });
    });

    it('appends to existing extra', () => {
      const stateWithExtra = createState({
        step: 'smart-followup',
        collectedInfo: { extra: '이전 답변' },
      });
      const result = handleSmartFollowup(
        { text: '추가 답변' },
        stateWithExtra,
        ['다음 질문'],
      );
      expect(result.actions).toContainEqual({
        type: 'UPDATE_COLLECTED_INFO',
        payload: { extra: '이전 답변\n추가 답변' },
      });
    });
  });

  describe('answer with no remaining questions', () => {
    it('stores answer and transitions to confirmation', () => {
      const result = handleSmartFollowup(
        { text: '마지막 답변이에요' },
        state,
        [],
      );
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'confirmation' });
      expect(result.actions).toContainEqual({
        type: 'UPDATE_COLLECTED_INFO',
        payload: { extra: '마지막 답변이에요' },
      });
    });
  });
});

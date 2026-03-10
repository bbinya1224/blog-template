import { describe, it, expect } from 'vitest';
import { handleReviewEdit, handleReviewEdited } from './reviewEdit';
import { initialConversationState } from '../../model/types';
import type { ConversationState } from '../../model/types';
import { MESSAGES } from '../../constants/messages';

function createState(overrides: Partial<ConversationState> = {}): ConversationState {
  return { ...initialConversationState, ...overrides };
}

describe('handleReviewEdit', () => {
  const state = createState({ step: 'review-edit', userName: '테스터' });

  describe('optionId routing', () => {
    it('complete → complete step with thanks message', () => {
      const result = handleReviewEdit({ text: '완벽해요!', optionId: 'complete' }, state);
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'complete' });
      expect(result.messages[0].content).toBe(MESSAGES.complete.thanks('테스터'));
    });

    it('edit → askEdit message, no step transition', () => {
      const result = handleReviewEdit({ text: '수정해주세요', optionId: 'edit' }, state);
      expect(result.actions).toEqual([]);
      expect(result.messages[0].content).toBe(MESSAGES.reviewEdit.askEdit);
    });
  });

  describe('text fallback - complete', () => {
    it.each(['완벽해요', '좋아요', '됐어', '확인'])('%s → complete step', (text) => {
      const result = handleReviewEdit({ text }, state);
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'complete' });
    });
  });

  describe('text fallback - edit request', () => {
    it('short "수정" → asks for detail', () => {
      const result = handleReviewEdit({ text: '수정해줘' }, state);
      expect(result.messages[0].content).toBe(MESSAGES.reviewEdit.askEdit);
      expect(result.sideEffect).toEqual({ type: 'none' });
    });

    it('long edit request (>=5 chars) → edit-review side effect', () => {
      const result = handleReviewEdit({ text: '첫 문장을 더 감성적으로 바꿔줘' }, state);
      expect(result.sideEffect).toEqual({ type: 'edit-review', request: '첫 문장을 더 감성적으로 바꿔줘' });
      expect(result.messages[0].type).toBe('loading');
    });
  });

  describe('ambiguous short input → re-ask with choices', () => {
    it('short unrecognized text → choice message', () => {
      const result = handleReviewEdit({ text: '흠' }, state);
      expect(result.messages[0].type).toBe('choice');
    });
  });
});

describe('handleReviewEdited', () => {
  it('returns review-preview with edited content', () => {
    const result = handleReviewEdited('수정된 리뷰 내용입니다.');
    expect(result.messages[0].type).toBe('review-preview');
    expect(result.messages[0].metadata.review).toBe('수정된 리뷰 내용입니다.');
    expect(result.messages[0].metadata.characterCount).toBe(13);
    expect(result.actions).toContainEqual({ type: 'SET_GENERATED_REVIEW', payload: '수정된 리뷰 내용입니다.' });
  });
});

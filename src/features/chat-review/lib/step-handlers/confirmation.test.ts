import { describe, it, expect } from 'vitest';
import { handleConfirmation, createSummaryMessage } from './confirmation';
import { initialConversationState } from '../../model/types';
import type { ConversationState } from '../../model/types';
import { MESSAGES } from '../../constants/messages';

function createState(overrides: Partial<ConversationState> = {}): ConversationState {
  return { ...initialConversationState, ...overrides };
}

describe('handleConfirmation', () => {
  const state = createState({ step: 'confirmation' });

  describe('optionId routing', () => {
    it('yes → generating step', () => {
      const result = handleConfirmation({ text: '네!', optionId: 'yes' }, state);
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'generating' });
      expect(result.messages[0].content).toBe(MESSAGES.confirmation.correct);
      expect(result.sideEffect).toEqual({ type: 'none' });
    });

    it('no → needsEdit message, no step transition', () => {
      const result = handleConfirmation({ text: '수정할 부분 있어', optionId: 'no' }, state);
      expect(result.actions).toEqual([]);
      expect(result.messages[0].content).toBe(MESSAGES.confirmation.needsEdit);
    });
  });

  describe('text fallback - 긍정', () => {
    it.each(['네', '맞아요', 'ㅇㅇ', 'yes', '완벽해요', '됐어'])('%s → generating', (text) => {
      const result = handleConfirmation({ text }, state);
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'generating' });
    });
  });

  describe('text fallback - 부정', () => {
    it.each(['수정할래', '아니 좀', '틀렸어', 'no', '고쳐줘'])('%s → needsEdit', (text) => {
      const result = handleConfirmation({ text }, state);
      expect(result.actions).toEqual([]);
      expect(result.messages[0].content).toBe(MESSAGES.confirmation.needsEdit);
    });
  });

  describe('field keyword → subStep 복귀', () => {
    // inputs must NOT contain '수정', '아니', '틀' — those match the negation branch first
    it.each([
      ['날짜 바꿀래', 'date'],
      ['언제 갔는지 바꿀래', 'date'],
      ['누구랑 갔는지 알려줘', 'companion'],
      ['장소 바꿀래', 'place'],
      ['매장 어디야', 'place'],
      ['메뉴 바꿔', 'menu'],
      ['맛 부분 다시', 'taste'],
      ['분위기 다시 입력', 'atmosphere'],
    ])('%s → subStep %s', (text, expectedSubStep) => {
      const result = handleConfirmation({ text }, state);
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'info-gathering' });
      expect(result.actions).toContainEqual({ type: 'SET_SUB_STEP', payload: expectedSubStep });
    });
  });

  describe('unrecognized input → re-ask with choices', () => {
    it('returns choice message with confirmInfo options', () => {
      const result = handleConfirmation({ text: '흠...' }, state);
      expect(result.messages[0].type).toBe('choice');
      expect(result.actions).toEqual([]);
    });
  });
});

describe('createSummaryMessage', () => {
  it('formats collected info into summary', () => {
    const state = createState({
      collectedInfo: {
        name: '맛있는 식당',
        location: '강남역',
        date: '오늘',
        companion: '친구',
        menu: '파스타',
      },
    });
    const msg = createSummaryMessage(state);
    expect(msg.type).toBe('summary');
    expect(msg.role).toBe('assistant');
    expect(msg.metadata.formattedSummary).toContain('맛있는 식당');
    expect(msg.metadata.formattedSummary).toContain('강남역');
    expect(msg.metadata.formattedSummary).toContain('오늘');
    expect(msg.metadata.formattedSummary).toContain('친구');
    expect(msg.metadata.formattedSummary).toContain('파스타');
  });

  it('includes pros when present', () => {
    const state = createState({
      collectedInfo: { pros: '맛이 좋았어요' },
    });
    const msg = createSummaryMessage(state);
    expect(msg.metadata.formattedSummary).toContain('좋았던 점');
    expect(msg.metadata.formattedSummary).toContain('맛이 좋았어요');
  });

  it('includes cons when present', () => {
    const state = createState({
      collectedInfo: { cons: '웨이팅이 길었어요' },
    });
    const msg = createSummaryMessage(state);
    expect(msg.metadata.formattedSummary).toContain('아쉬웠던 점');
  });

  it('shows fallback text for missing fields', () => {
    const state = createState();
    const msg = createSummaryMessage(state);
    expect(msg.metadata.formattedSummary).toContain('매장명 미입력');
    expect(msg.metadata.formattedSummary).toContain('위치 미입력');
  });
});

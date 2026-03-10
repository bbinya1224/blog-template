import { describe, it, expect } from 'vitest';
import { handleInfoGathering, handlePlaceConfirmed } from './infoGathering';
import { initialConversationState } from '../../model/types';
import type { ConversationState } from '../../model/types';
import { MESSAGES } from '../../constants/messages';

function createState(overrides: Partial<ConversationState> = {}): ConversationState {
  return { ...initialConversationState, ...overrides };
}

describe('handleInfoGathering', () => {
  describe('date subStep', () => {
    const state = createState({ step: 'info-gathering', subStep: 'date' });

    it('optionId "today" → stores date and moves to companion', () => {
      const result = handleInfoGathering({ text: '오늘', optionId: 'today' }, state);
      expect(result.actions).toContainEqual(expect.objectContaining({ type: 'UPDATE_COLLECTED_INFO' }));
      expect(result.actions).toContainEqual({ type: 'SET_SUB_STEP', payload: 'companion' });
      expect(result.messages[0].type).toBe('choice');
    });

    it('free text date → stores and moves to companion', () => {
      const result = handleInfoGathering({ text: '지난 주말' }, state);
      expect(result.actions).toContainEqual({ type: 'SET_SUB_STEP', payload: 'companion' });
    });
  });

  describe('companion subStep', () => {
    const state = createState({ step: 'info-gathering', subStep: 'companion' });

    it('optionId "friend" → stores companion label and moves to place', () => {
      const result = handleInfoGathering({ text: '친구', optionId: 'friend' }, state);
      expect(result.actions).toContainEqual({ type: 'SET_SUB_STEP', payload: 'place' });
      expect(result.messages[0].content).toContain('친구');
    });
  });

  describe('place subStep', () => {
    const state = createState({ step: 'info-gathering', subStep: 'place' });

    it('text → place-search side effect', () => {
      const result = handleInfoGathering({ text: '강남 맛집' }, state);
      expect(result.sideEffect).toEqual({ type: 'place-search', query: '강남 맛집' });
      expect(result.messages[0].type).toBe('loading');
    });
  });

  describe('menu subStep', () => {
    const state = createState({ step: 'info-gathering', subStep: 'menu' });

    it('stores menu and moves to taste', () => {
      const result = handleInfoGathering({ text: '까르보나라 파스타' }, state);
      expect(result.actions).toContainEqual({ type: 'UPDATE_COLLECTED_INFO', payload: { menu: '까르보나라 파스타' } });
      expect(result.actions).toContainEqual({ type: 'SET_SUB_STEP', payload: 'taste' });
    });
  });

  describe('taste subStep', () => {
    const state = createState({ step: 'info-gathering', subStep: 'taste' });

    it('stores taste as pros and moves to atmosphere', () => {
      const result = handleInfoGathering({ text: '크림이 진하고 맛있었어요' }, state);
      expect(result.actions).toContainEqual({ type: 'UPDATE_COLLECTED_INFO', payload: { pros: '크림이 진하고 맛있었어요' } });
      expect(result.actions).toContainEqual({ type: 'SET_SUB_STEP', payload: 'atmosphere' });
    });
  });

  describe('atmosphere subStep', () => {
    const state = createState({ step: 'info-gathering', subStep: 'atmosphere' });

    it('stores atmosphere in extra and moves to highlight', () => {
      const result = handleInfoGathering({ text: '아늑하고 조용했어요' }, state);
      const updateAction = result.actions.find(a => a.type === 'UPDATE_COLLECTED_INFO');
      expect((updateAction as any).payload.extra).toContain('분위기: 아늑하고 조용했어요');
      expect(result.actions).toContainEqual({ type: 'SET_SUB_STEP', payload: 'highlight' });
    });
  });

  describe('highlight subStep', () => {
    const state = createState({ step: 'info-gathering', subStep: 'highlight' });

    it('transitions to smart-followup after highlight', () => {
      const result = handleInfoGathering({ text: '디저트가 기억에 남아요' }, state);
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'smart-followup' });
    });
  });
});

describe('handlePlaceConfirmed', () => {
  const state = createState({ step: 'info-gathering', subStep: 'place' });

  it('confirmed → stores name/location and moves to menu', () => {
    const result = handlePlaceConfirmed(true, '스시오마카세', '강남구 역삼동', state, '일식 > 스시');
    expect(result.actions).toContainEqual({
      type: 'UPDATE_COLLECTED_INFO',
      payload: { name: '스시오마카세', location: '강남구 역삼동' },
    });
    expect(result.actions).toContainEqual({ type: 'SET_SUB_STEP', payload: 'menu' });
    expect(result.messages[0].content).toContain('스시오마카세');
    expect(result.messages[0].content).toContain('스시 전문점');
  });

  it('confirmed without category → no subcategory detail', () => {
    const result = handlePlaceConfirmed(true, '맛집A', '서울시', state);
    expect(result.messages[0].content).not.toContain('전문점');
  });

  it('not confirmed → placeNotFound message', () => {
    const result = handlePlaceConfirmed(false, '잘못된곳', '어딘가', state);
    expect(result.messages[0].content).toBe(MESSAGES.infoGathering.restaurant.placeNotFound);
    expect(result.actions).toEqual([]);
  });
});

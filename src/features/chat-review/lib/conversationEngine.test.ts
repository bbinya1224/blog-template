import { describe, it, expect } from 'vitest';
import {
  canTransition,
  determineNextStep,
  isInfoGatheringComplete,
  determineInfoSubStep,
  classifyIntent,
  extractDateInfo,
  extractCompanionInfo,
} from './conversationEngine';
import type {
  ConversationState,
  ConversationStep,
} from '../model/types';
import { stepTransitions, initialConversationState } from '../model/types';

function createState(overrides: Partial<ConversationState> = {}): ConversationState {
  return { ...initialConversationState, ...overrides };
}

describe('conversationEngine', () => {
  describe('classifyIntent', () => {
    describe('confirm_yes', () => {
      it.each([
        '네',
        '예',
        '응',
        '좋아',
        '확인',
        '맞아',
        '그래',
        'ㅇㅇ',
        'ok',
        'yes',
      ])('should classify "%s" as confirm_yes', (input) => {
        expect(classifyIntent(input)).toBe('confirm_yes');
      });

      it('should handle whitespace', () => {
        expect(classifyIntent('  네  ')).toBe('confirm_yes');
      });

      it('should match prefix', () => {
        expect(classifyIntent('네, 맞아요')).toBe('confirm_yes');
        expect(classifyIntent('예, 좋아요')).toBe('confirm_yes');
      });
    });

    describe('confirm_no', () => {
      it.each([
        '아니',
        '아뇨',
        '노',
        'no',
        '다시',
        '수정',
        '틀려',
      ])('should classify "%s" as confirm_no', (input) => {
        expect(classifyIntent(input)).toBe('confirm_no');
      });
    });

    describe('skip', () => {
      it.each([
        '건너뛰기',
        '스킵',
        'skip',
        '패스',
        'pass',
        '없어',
        '몰라',
      ])('should classify "%s" as skip', (input) => {
        expect(classifyIntent(input)).toBe('skip');
      });
    });

    describe('help', () => {
      it.each([
        '도움',
        'help',
        '뭐',
        '어떻게',
        '모르겠어',
      ])('should classify "%s" as help', (input) => {
        expect(classifyIntent(input)).toBe('help');
      });
    });

    describe('restart', () => {
      it.each([
        '처음부터',
        '시작',
        '리셋',
        'reset',
      ])('should classify "%s" as restart', (input) => {
        expect(classifyIntent(input)).toBe('restart');
      });

      it('should classify "다시 시작" as confirm_no due to regex order', () => {
        expect(classifyIntent('다시 시작')).toBe('confirm_no');
      });
    });

    describe('modify_previous', () => {
      it.each([
        '이거 수정해줘',
        '바꿔줘',
        '변경해줘',
        '고쳐줘',
      ])('should classify "%s" as modify_previous', (input) => {
        expect(classifyIntent(input)).toBe('modify_previous');
      });

      it('should classify "수정할게요" as confirm_no due to regex order', () => {
        expect(classifyIntent('수정할게요')).toBe('confirm_no');
      });
    });

    describe('answer (default)', () => {
      it.each([
        '강남역 맛집',
        '불고기 먹었어',
        'random text',
        '어제 친구랑 갔어요',
        '',
      ])('should classify "%s" as answer', (input) => {
        expect(classifyIntent(input)).toBe('answer');
      });
    });
  });

  describe('extractDateInfo', () => {
    it('should extract "오늘" as today\'s ISO date', () => {
      const result = extractDateInfo('오늘 갔어요');
      const today = new Date().toISOString().split('T')[0];
      expect(result).toBe(today);
    });

    it('should extract "어제" as yesterday\'s ISO date', () => {
      const result = extractDateInfo('어제 다녀왔어');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const expected = yesterday.toISOString().split('T')[0];
      expect(result).toBe(expected);
    });

    it('should extract "이번 주"', () => {
      expect(extractDateInfo('이번 주에 갔어요')).toBe('이번 주');
      expect(extractDateInfo('이번주')).toBe('이번 주');
    });

    it('should parse date patterns', () => {
      const year = new Date().getFullYear();
      expect(extractDateInfo('2월3일')).toBe(`${year}-02-03`);
      expect(extractDateInfo('2/3')).toBe(`${year}-02-03`);
      expect(extractDateInfo('02-03')).toBe(`${year}-02-03`);
      expect(extractDateInfo('12월25일에 갔어')).toBe(`${year}-12-25`);
    });

    it('should return input as-is for dates with spaces', () => {
      expect(extractDateInfo('2월 3일')).toBe('2월 3일');
      expect(extractDateInfo('12월 25일')).toBe('12월 25일');
    });

    it('should return input as-is if no pattern matches', () => {
      expect(extractDateInfo('지난주 금요일')).toBe('지난주 금요일');
      expect(extractDateInfo('한참 전')).toBe('한참 전');
    });
  });

  describe('extractCompanionInfo', () => {
    it('should extract "혼자"', () => {
      expect(extractCompanionInfo('혼자 갔어')).toBe('혼자');
      expect(extractCompanionInfo('혼밥했어요')).toBe('혼자');
    });

    it('should extract "친구"', () => {
      expect(extractCompanionInfo('친구랑 갔어')).toBe('친구');
    });

    it('should extract "가족"', () => {
      expect(extractCompanionInfo('가족이랑')).toBe('가족');
      expect(extractCompanionInfo('엄마랑 갔어')).toBe('가족');
      expect(extractCompanionInfo('아빠랑')).toBe('가족');
      expect(extractCompanionInfo('부모님이랑')).toBe('가족');
    });

    it('should extract "연인"', () => {
      expect(extractCompanionInfo('연인이랑')).toBe('연인');
      expect(extractCompanionInfo('여친이랑 갔어')).toBe('연인');
      expect(extractCompanionInfo('남친이랑')).toBe('연인');
      expect(extractCompanionInfo('애인이랑')).toBe('연인');
    });

    it('should extract "직장 동료"', () => {
      expect(extractCompanionInfo('회사 동료')).toBe('직장 동료');
      expect(extractCompanionInfo('직장 동료랑')).toBe('직장 동료');
      expect(extractCompanionInfo('동료랑 갔어')).toBe('직장 동료');
    });

    it('should return input as-is if no pattern matches', () => {
      expect(extractCompanionInfo('선배랑 갔어요')).toBe('선배랑 갔어요');
      expect(extractCompanionInfo('후배들이랑')).toBe('후배들이랑');
    });
  });

  describe('canTransition', () => {
    it('should allow valid transitions', () => {
      expect(canTransition('style-check', 'topic-select', stepTransitions)).toBe(true);
      expect(canTransition('style-check', 'style-setup', stepTransitions)).toBe(true);
      expect(canTransition('info-gathering', 'smart-followup', stepTransitions)).toBe(true);
      expect(canTransition('generating', 'review-edit', stepTransitions)).toBe(true);
    });

    it('should reject invalid transitions', () => {
      expect(canTransition('style-check', 'generating', stepTransitions)).toBe(false);
      expect(canTransition('complete', 'style-check', stepTransitions)).toBe(false);
      expect(canTransition('topic-select', 'generating', stepTransitions)).toBe(false);
    });
  });

  describe('isInfoGatheringComplete', () => {
    it('should return true when all required fields are present', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          companion: '친구',
          location: '강남역',
          name: '맛집',
          menu: '불고기',
          pros: '맛있어요',
        },
      });
      expect(isInfoGatheringComplete(state)).toBe(true);
    });

    it('should return false when date is missing', () => {
      const state = createState({
        collectedInfo: {
          companion: '친구',
          location: '강남역',
          menu: '불고기',
          pros: '맛있어요',
        },
      });
      expect(isInfoGatheringComplete(state)).toBe(false);
    });

    it('should return false when companion is missing', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          location: '강남역',
          menu: '불고기',
          pros: '맛있어요',
        },
      });
      expect(isInfoGatheringComplete(state)).toBe(false);
    });

    it('should return false when location is missing', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          companion: '친구',
          menu: '불고기',
          pros: '맛있어요',
        },
      });
      expect(isInfoGatheringComplete(state)).toBe(false);
    });

    it('should return false when menu is missing', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          companion: '친구',
          location: '강남역',
          pros: '맛있어요',
        },
      });
      expect(isInfoGatheringComplete(state)).toBe(false);
    });

    it('should return false when pros is missing', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          companion: '친구',
          location: '강남역',
          menu: '불고기',
        },
      });
      expect(isInfoGatheringComplete(state)).toBe(false);
    });

    it('should return false for empty collectedInfo', () => {
      const state = createState({ collectedInfo: {} });
      expect(isInfoGatheringComplete(state)).toBe(false);
    });
  });

  describe('determineInfoSubStep', () => {
    it('should return "date" when collectedInfo is empty', () => {
      const state = createState({ collectedInfo: {} });
      expect(determineInfoSubStep(state)).toBe('date');
    });

    it('should return "companion" when only date is present', () => {
      const state = createState({
        collectedInfo: { date: '2026-02-15' },
      });
      expect(determineInfoSubStep(state)).toBe('companion');
    });

    it('should return "place" when date and companion are present', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          companion: '친구',
        },
      });
      expect(determineInfoSubStep(state)).toBe('place');
    });

    it('should return "place" when location is present but name is missing', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          companion: '친구',
          location: '강남역',
        },
      });
      expect(determineInfoSubStep(state)).toBe('place');
    });

    it('should return "menu" when location and name are present', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          companion: '친구',
          location: '강남역',
          name: '맛집',
        },
      });
      expect(determineInfoSubStep(state)).toBe('menu');
    });

    it('should return "taste" when menu is present', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          companion: '친구',
          location: '강남역',
          name: '맛집',
          menu: '불고기',
        },
      });
      expect(determineInfoSubStep(state)).toBe('taste');
    });

    it('should return "atmosphere" when pros is present', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          companion: '친구',
          location: '강남역',
          name: '맛집',
          menu: '불고기',
          pros: '맛있어요',
        },
      });
      expect(determineInfoSubStep(state)).toBe('atmosphere');
    });

    it('should return "highlight" when extra is present', () => {
      const state = createState({
        collectedInfo: {
          date: '2026-02-15',
          companion: '친구',
          location: '강남역',
          name: '맛집',
          menu: '불고기',
          pros: '맛있어요',
          extra: '분위기가 좋아요',
        },
      });
      expect(determineInfoSubStep(state)).toBe('highlight');
    });
  });
});

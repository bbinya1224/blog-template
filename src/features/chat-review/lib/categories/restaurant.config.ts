/**
 * Restaurant Category Configuration
 * 맛집 카테고리 설정
 */

import type { CategoryConfig } from './types';
import type { RestaurantPayload } from '@/shared/types/review';
import type { RestaurantInfoStep } from '../../model/types';

/**
 * 맛집 정보 수집 단계별 선택지 옵션
 */
export const RESTAURANT_CHOICE_OPTIONS = {
  date: [
    { id: 'today', label: '오늘' },
    { id: 'yesterday', label: '어제' },
    { id: 'this-week', label: '이번 주' },
    { id: 'custom', label: '📅 날짜 직접 선택' },
  ],
  companion: [
    { id: 'alone', label: '혼자' },
    { id: 'friend', label: '친구' },
    { id: 'family', label: '가족' },
    { id: 'lover', label: '연인' },
    { id: 'colleague', label: '직장 동료' },
    { id: 'custom', label: '✏️ 직접 입력' },
  ],
  additional: [
    { id: 'waiting', label: '웨이팅 정보' },
    { id: 'price', label: '가격대' },
    { id: 'other-menu', label: '다른 메뉴' },
    { id: 'done', label: '됐어요, 이만하면 충분해요!' },
  ],
} as const;

/**
 * 맛집 카테고리 설정
 */
export const restaurantConfig: CategoryConfig<
  RestaurantPayload,
  RestaurantInfoStep
> = {
  id: 'restaurant',
  name: '맛집',
  icon: '🍽️',

  steps: [
    { id: 'date', type: 'choice', isRequired: true, field: 'date' },
    { id: 'companion', type: 'choice', isRequired: true, field: 'companion' },
    { id: 'place', type: 'search', isRequired: true, field: 'name' },
    { id: 'menu', type: 'input', isRequired: true, field: 'menu' },
    { id: 'experience', type: 'input', isRequired: true, field: 'pros' },
    {
      id: 'additional',
      type: 'choice',
      isRequired: false,
      field: 'extra',
      skipLabel: '됐어요',
    },
  ],

  stepOrder: ['date', 'companion', 'place', 'menu', 'experience', 'additional'],

  messages: {
    date: '맛집 리뷰군요!\n언제 식사하러 가셨어요?',
    companion: (ctx) =>
      `${ctx.date || ''}에 다녀오셨군요!\n누구랑 같이 가셨어요?`,
    place: (ctx) =>
      `${ctx.companion || ''}이랑 맛있는 거 먹으러 가셨군요!\n\n어느 매장에서 어떤 음식을 드셨어요?\n더 알려주세요.`,
    menu: '뭘 드셨어요? 메뉴 이름을 알려주세요.',
    experience: '맛이나 분위기, 기억에 남는 거\n자유롭게 얘기해주세요.',
    additional: '혹시 더 알려주실 내용이 있나요?',
  },

  choiceOptions: {
    date: RESTAURANT_CHOICE_OPTIONS.date,
    companion: RESTAURANT_CHOICE_OPTIONS.companion,
    additional: RESTAURANT_CHOICE_OPTIONS.additional,
  },

  extractors: {
    date: (input: string): string => {
      const today = new Date();
      const lowered = input.toLowerCase();

      if (lowered.includes('오늘')) {
        return today.toISOString().split('T')[0];
      }
      if (lowered.includes('어제')) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
      }
      if (lowered.includes('이번 주') || lowered.includes('이번주')) {
        return '이번 주';
      }

      const datePattern = /(\d{1,2})[월\/\-](\d{1,2})/;
      const match = input.match(datePattern);
      if (match) {
        const month = parseInt(match[1], 10);
        const day = parseInt(match[2], 10);
        return `${today.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      return input;
    },
    companion: (input: string): string => {
      const lowered = input.toLowerCase();

      if (lowered.includes('혼자') || lowered.includes('혼밥')) return '혼자';
      if (lowered.includes('친구')) return '친구';
      if (
        lowered.includes('가족') ||
        lowered.includes('부모') ||
        lowered.includes('엄마') ||
        lowered.includes('아빠')
      )
        return '가족';
      if (
        lowered.includes('연인') ||
        lowered.includes('애인') ||
        lowered.includes('남친') ||
        lowered.includes('여친')
      )
        return '연인';
      if (
        lowered.includes('동료') ||
        lowered.includes('회사') ||
        lowered.includes('직장')
      )
        return '직장 동료';

      return input;
    },
  },

  experienceKeywords: {
    positive: [
      '맛있',
      '좋',
      '최고',
      '친절',
      '깔끔',
      '분위기',
      '예쁜',
      '싱싱',
      '쫄깃',
    ],
    negative: ['아쉬', '별로', '실망', '비싸', '느린', '불친절', '기다'],
  },

  isComplete: (payload) =>
    !!(
      payload.date &&
      payload.companion &&
      payload.location &&
      payload.menu &&
      (payload.pros || payload.extra)
    ),
};

import type { CategoryConfig } from './types';
import type { RestaurantPayload } from '@/shared/types/review';
import type { RestaurantInfoStep } from '../../model/types';

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
};

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
    { id: 'taste', type: 'input', isRequired: true, field: 'pros' },
    { id: 'atmosphere', type: 'input', isRequired: true, field: 'extra' },
    { id: 'highlight', type: 'input', isRequired: true, field: 'dynamic' },
  ],

  stepOrder: ['date', 'companion', 'place', 'menu', 'taste', 'atmosphere', 'highlight'],

  messages: {
    date: '맛집 리뷰군요!\n언제 식사하러 가셨어요?',
    companion: (ctx) =>
      `${ctx.date || ''}에 다녀오셨군요!\n누구랑 같이 가셨어요?`,
    place: (ctx) => {
      const companion = ctx.companion || '';
      if (companion === '혼자') {
        return `혼자 다녀오셨군요!\n\n어느 매장에서 어떤 음식을 드셨어요?\n더 알려주세요.`;
      }
      return `${companion}이랑 맛있는 거 먹으러 가셨군요!\n\n어느 매장에서 어떤 음식을 드셨어요?\n더 알려주세요.`;
    },
    menu: '뭘 드셨어요? 메뉴 이름을 알려주세요.',
    taste: '첫 한 입의 느낌이 어땠어요?\n맛, 식감, 비주얼 뭐든 좋아요 🍴',
    atmosphere: '가게 분위기는 어땠어요?\n인테리어나 음악, 직원 서비스 같은 것도요 ✨',
    highlight: '가장 기억에 남는 순간이 있어요?\n좋았던 것도, 아쉬웠던 것도요 💭',
  },

  choiceOptions: {
    date: RESTAURANT_CHOICE_OPTIONS.date,
    companion: RESTAURANT_CHOICE_OPTIONS.companion,
  },

  extractors: {
    date: (input: string): string => {
      const formatLocalDate = (d: Date): string => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const today = new Date();
      const lowered = input.toLowerCase();

      if (lowered.includes('오늘')) {
        return formatLocalDate(today);
      }
      if (lowered.includes('어제')) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatLocalDate(yesterday);
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
      '행복',
      '만족',
    ],
    negative: ['아쉬', '별로', '실망', '비싸', '느린', '불친절', '기다', '짜증'],
  },

  isComplete: (payload) =>
    !!(
      payload.date &&
      payload.companion &&
      payload.location &&
      payload.menu &&
      payload.pros
    ),
};

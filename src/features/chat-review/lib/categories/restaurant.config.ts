import type { CategoryConfig } from './types';
import type { RestaurantPayload } from '@/shared/types/review';
import type { RestaurantInfoStep } from '../../model/types';
import { CHOICE_OPTIONS } from '../../constants/choiceOptions';
import {
  extractDateInfo,
  extractCompanionInfo,
} from '../conversation/conversationEngine';

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
    date: CHOICE_OPTIONS.visitDate,
    companion: CHOICE_OPTIONS.companion,
  },

  extractors: {
    date: extractDateInfo,
    companion: extractCompanionInfo,
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

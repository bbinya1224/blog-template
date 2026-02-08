/**
 * Book Category Configuration
 * 책 카테고리 설정
 */

import type { CategoryConfig } from './types';
import type { BookPayload } from '@/shared/types/review';
import type { BookInfoStep } from '../../model/types';

/**
 * 책 정보 수집 단계별 선택지 옵션
 */
export const BOOK_CHOICE_OPTIONS = {
  readDate: [
    { id: 'recent', label: '최근에' },
    { id: 'this-month', label: '이번 달' },
    { id: 'this-year', label: '올해' },
    { id: 'skip', label: '기억 안나요' },
  ],
  genre: [
    { id: 'fiction', label: '소설' },
    { id: 'essay', label: '에세이' },
    { id: 'self-help', label: '자기계발' },
    { id: 'history', label: '역사' },
    { id: 'science', label: '과학' },
    { id: 'custom', label: '✏️ 직접 입력' },
  ],
  additional: [
    { id: 'rating', label: '별점 매기기' },
    { id: 'quote', label: '인상 깊은 구절' },
    { id: 'recommend', label: '추천 대상' },
    { id: 'done', label: '됐어요, 이만하면 충분해요!' },
  ],
};

/**
 * 책 카테고리 설정
 */
export const bookConfig: CategoryConfig<BookPayload, BookInfoStep> = {
  id: 'book',
  name: '책',
  icon: '📚',

  steps: [
    { id: 'title', type: 'input', isRequired: true, field: 'title' },
    { id: 'author', type: 'input', isRequired: true, field: 'author' },
    {
      id: 'readDate',
      type: 'choice',
      isRequired: false,
      field: 'readDate',
      skipLabel: '기억 안나요',
    },
    {
      id: 'genre',
      type: 'choice',
      isRequired: false,
      field: 'genre',
      skipLabel: '건너뛰기',
    },
    { id: 'experience', type: 'input', isRequired: true, field: 'pros' },
    {
      id: 'additional',
      type: 'choice',
      isRequired: false,
      field: 'extra',
      skipLabel: '됐어요',
    },
  ],

  stepOrder: [
    'title',
    'author',
    'readDate',
    'genre',
    'experience',
    'additional',
  ],

  messages: {
    title: '책 리뷰군요!\n어떤 책을 읽으셨어요? 책 제목을 알려주세요.',
    author: (ctx) => `"${ctx.title ?? '이 책'}" 좋은 책이네요!\n저자가 누구인가요?`,
    readDate: '언제쯤 읽으셨어요?',
    genre: '어떤 장르의 책인가요?',
    experience:
      '이 책에서 인상 깊었던 부분이나\n느낀 점을 자유롭게 얘기해주세요.',
    additional: '혹시 더 알려주실 내용이 있나요?',
  },

  choiceOptions: {
    readDate: BOOK_CHOICE_OPTIONS.readDate,
    genre: BOOK_CHOICE_OPTIONS.genre,
    additional: BOOK_CHOICE_OPTIONS.additional,
  },

  extractors: {
    readDate: (input: string): string => {
      const lowered = input.toLowerCase();

      if (lowered.includes('최근')) return '최근';
      if (lowered.includes('이번 달')) return '이번 달';
      if (lowered.includes('올해')) return '올해';
      if (lowered.includes('기억') || lowered.includes('모르')) return '';

      return input;
    },
    genre: (input: string): string => {
      const lowered = input.toLowerCase();

      if (lowered.includes('소설')) return '소설';
      if (lowered.includes('에세이')) return '에세이';
      if (lowered.includes('자기계발') || lowered.includes('자기 계발'))
        return '자기계발';
      if (lowered.includes('역사')) return '역사';
      if (lowered.includes('과학')) return '과학';

      return input;
    },
  },

  experienceKeywords: {
    positive: [
      '감동',
      '재미',
      '좋',
      '추천',
      '인상',
      '깊',
      '몰입',
      '흥미',
      '유익',
      '배움',
    ],
    negative: ['아쉬', '지루', '별로', '실망', '어려', '난해'],
  },

  isComplete: (payload) =>
    !!(payload.title && payload.author && (payload.pros || payload.extra)),
};

import { describe, it, expect } from 'vitest';
import { groupReviewsByMonth } from './groupReviewsByMonth';
import type { Review } from '../model/review';

function createReview(overrides: Partial<Review> = {}): Review {
  return {
    id: '1',
    storeName: '테스트 가게',
    date: '2024-12-15',
    createdAt: '2024-12-15T10:00:00Z',
    content: '맛있었습니다',
    characterCount: 6,
    conversation: [],
    ...overrides,
  };
}

describe('groupReviewsByMonth', () => {
  it('빈 배열이면 빈 배열을 반환한다', () => {
    expect(groupReviewsByMonth([])).toEqual([]);
  });

  it('단일 리뷰를 올바른 월 그룹에 배치한다', () => {
    const reviews = [createReview()];
    const result = groupReviewsByMonth(reviews);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('2024년 12월');
    expect(result[0].yearMonth).toBe('2024-12');
    expect(result[0].reviews).toHaveLength(1);
  });

  it('같은 월의 복수 리뷰를 하나의 그룹으로 묶는다', () => {
    const reviews = [
      createReview({ id: '1', date: '2024-12-01' }),
      createReview({ id: '2', date: '2024-12-25' }),
    ];
    const result = groupReviewsByMonth(reviews);

    expect(result).toHaveLength(1);
    expect(result[0].reviews).toHaveLength(2);
  });

  it('복수 월을 최신 월 먼저 내림차순 정렬한다', () => {
    const reviews = [
      createReview({ id: '1', date: '2024-10-05' }),
      createReview({ id: '2', date: '2025-01-10' }),
      createReview({ id: '3', date: '2024-12-15' }),
    ];
    const result = groupReviewsByMonth(reviews);

    expect(result).toHaveLength(3);
    expect(result[0].yearMonth).toBe('2025-01');
    expect(result[1].yearMonth).toBe('2024-12');
    expect(result[2].yearMonth).toBe('2024-10');
  });

  it('label에서 월 앞의 0을 제거한다', () => {
    const reviews = [createReview({ date: '2024-03-01' })];
    const result = groupReviewsByMonth(reviews);

    expect(result[0].label).toBe('2024년 3월');
  });
});

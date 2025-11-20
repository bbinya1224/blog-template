/**
 * 타입 안전한 Validation 함수 모음
 * 순수 함수로 구성되어 재사용 가능하며 테스트 용이
 */

import type { ReviewPayload, AnalyzePayload } from '@/lib/types';
import { ValidationError } from '@/lib/errors';
import { isValidNaverRssUrl, isNonEmptyString } from '@/lib/utils';

/**
 * AnalyzePayload 검증
 */
export const validateAnalyzePayload = (
  payload: unknown,
): payload is AnalyzePayload => {
  if (typeof payload !== 'object' || payload === null) {
    throw new ValidationError('유효하지 않은 요청 데이터입니다.');
  }

  const data = payload as Partial<AnalyzePayload>;

  if (!isNonEmptyString(data.rssUrl)) {
    throw new ValidationError('RSS URL이 필요합니다.');
  }

  if (!isValidNaverRssUrl(data.rssUrl)) {
    throw new ValidationError(
      '유효한 네이버 블로그 RSS URL을 입력해주세요. (예: https://rss.blog.naver.com/블로그ID.xml)',
    );
  }

  if (data.maxPosts !== undefined) {
    if (typeof data.maxPosts !== 'number' || data.maxPosts < 1) {
      throw new ValidationError('최근 글 개수는 1 이상이어야 합니다.');
    }
    if (data.maxPosts > 50) {
      throw new ValidationError('최근 글 개수는 50개를 초과할 수 없습니다.');
    }
  }

  return true;
};

/**
 * ReviewPayload 검증
 */
export const validateReviewPayload = (
  payload: unknown,
): payload is ReviewPayload => {
  if (typeof payload !== 'object' || payload === null) {
    throw new ValidationError('유효하지 않은 요청 데이터입니다.');
  }

  const data = payload as Partial<ReviewPayload>;

  if (!isNonEmptyString(data.name)) {
    throw new ValidationError('가게명은 필수 입력 항목입니다.');
  }

  if (!isNonEmptyString(data.location)) {
    throw new ValidationError('위치는 필수 입력 항목입니다.');
  }

  if (!isNonEmptyString(data.date)) {
    throw new ValidationError('방문 날짜는 필수 입력 항목입니다.');
  }

  // 날짜 형식 검증
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.date)) {
    throw new ValidationError(
      '날짜는 YYYY-MM-DD 형식이어야 합니다. (예: 2024-01-15)',
    );
  }

  if (!isNonEmptyString(data.summary)) {
    throw new ValidationError('한줄평은 필수 입력 항목입니다.');
  }

  return true;
};

/**
 * 리뷰 수정 요청 검증
 */
export const validateEditRequest = (payload: unknown): boolean => {
  if (typeof payload !== 'object' || payload === null) {
    throw new ValidationError('유효하지 않은 요청 데이터입니다.');
  }

  const data = payload as { review?: unknown; request?: unknown };

  if (!isNonEmptyString(data.review)) {
    throw new ValidationError('원본 리뷰가 필요합니다.');
  }

  if (!isNonEmptyString(data.request)) {
    throw new ValidationError('수정 요청 내용이 필요합니다.');
  }

  return true;
};

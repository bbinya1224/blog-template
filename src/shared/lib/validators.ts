/**
 * 타입 안전한 Validation 함수 모음
 * 순수 함수로 구성되어 재사용 가능하며 테스트 용이
 */

import type { ReviewPayload, ReviewEditPayload } from '@/entities/review/model/types';
import type { AnalyzePayload } from '@/features/analyze-style/model/types';
import { ValidationError } from '@/shared/lib/errors';
import { isValidNaverRssUrl, isNonEmptyString } from '@/shared/lib/utils';

/**
 * AnalyzePayload 검증
 * @throws {ValidationError} 검증 실패 시
 */
export const isValidAnalyzePayload = (
  payload: unknown,
): payload is AnalyzePayload => {
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('유효하지 않은 요청 데이터입니다.');
  }

  const p = payload as Record<string, unknown>;

  if (!isNonEmptyString(p.rssUrl)) {
    throw new ValidationError('RSS URL이 필요합니다.');
  }

  if (!isValidNaverRssUrl(p.rssUrl)) {
    throw new ValidationError(
      '유효한 네이버 블로그 RSS URL을 입력해주세요. (예: https://rss.blog.naver.com/블로그ID.xml)',
    );
  }

  if (p.maxPosts !== undefined) {
    if (typeof p.maxPosts !== 'number' || p.maxPosts < 1) {
      throw new ValidationError('최근 글 개수는 1 이상이어야 합니다.');
    }
    if (p.maxPosts > 50) {
      throw new ValidationError('최근 글 개수는 50개를 초과할 수 없습니다.');
    }
  }

  return true;
};

/**
 * ReviewPayload 검증
 * @throws {ValidationError} 검증 실패 시
 */
export const isValidReviewPayload = (
  payload: unknown,
): payload is ReviewPayload => {
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('유효하지 않은 요청 데이터입니다.');
  }

  const p = payload as Record<string, unknown>;

  if (!isNonEmptyString(p.name)) {
    throw new ValidationError('가게명은 필수 입력 항목입니다.');
  }

  if (!isNonEmptyString(p.location)) {
    throw new ValidationError('위치는 필수 입력 항목입니다.');
  }

  if (!isNonEmptyString(p.date)) {
    throw new ValidationError('방문 날짜는 필수 입력 항목입니다.');
  }

  // 날짜 형식 검증
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(p.date as string)) {
    throw new ValidationError(
      '날짜는 YYYY-MM-DD 형식이어야 합니다. (예: 2024-01-15)',
    );
  }

  if (!isNonEmptyString(p.summary)) {
    throw new ValidationError('한줄평은 필수 입력 항목입니다.');
  }

  return true;
};

/**
 * 리뷰 수정 요청 검증
 * @throws {ValidationError} 검증 실패 시
 */
export const isValidEditRequest = (
  payload: unknown,
): payload is ReviewEditPayload => {
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('유효하지 않은 요청 데이터입니다.');
  }

  const p = payload as Record<string, unknown>;

  if (!isNonEmptyString(p.review)) {
    throw new ValidationError('원본 리뷰가 필요합니다.');
  }

  if (!isNonEmptyString(p.request)) {
    throw new ValidationError('수정 요청 내용이 필요합니다.');
  }

  return true;
};

/**
 * 타입 안전한 Validation 함수 모음
 */

import type { ReviewPayload, ReviewEditPayload } from '@/shared/types/review';
import type { AnalyzePayload } from '@/shared/types/analyze';
import { ValidationError } from '@/shared/lib/errors';
import { isValidNaverRssUrl, isNonEmptyString } from '@/shared/lib/utils';

// ============================================
// 공통 정규식 패턴
// ============================================

export const EMAIL_REGEX = /^[\w.-]+@[\w.-]+\.\w+$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ============================================
// 공통 검증 함수
// ============================================

/**
 * 이메일 형식 검증
 */
export const isValidEmail = (email: unknown): email is string => {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
};

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

  if (!isNonEmptyString(p.menu)) {
    throw new ValidationError('주문한 메뉴는 필수 입력 항목입니다.');
  }

  // 날짜 형식 검증
  if (!DATE_REGEX.test(p.date as string)) {
    throw new ValidationError(
      '날짜는 YYYY-MM-DD 형식이어야 합니다. (예: 2024-01-15)',
    );
  }

  // 실제 날짜 유효성 검사
  const dateObj = new Date(p.date as string);
  if (isNaN(dateObj.getTime())) {
    throw new ValidationError(
      '유효하지 않은 날짜입니다. 올바른 날짜를 입력해주세요.',
    );
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

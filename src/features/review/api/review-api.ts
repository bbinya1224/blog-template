/**
 * 리뷰 생성/수정 API
 * - 비즈니스 로직을 순수 함수로 분리
 */

import type { ReviewPayload } from '@/entities/review/model/types';
import type { StyleProfile } from '@/entities/style-profile/model/types';

/**
 * 스타일 프로필 로드 (localStorage → API 폴백)
 */
export const loadStyleProfile = async (): Promise<StyleProfile | null> => {
  // 1. localStorage에서 먼저 확인
  if (typeof window !== 'undefined') {
    const savedProfile = localStorage.getItem('styleProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile) as StyleProfile;
    }
  }

  // 2. localStorage에 없으면 API에서 불러오기
  try {
    const response = await fetch('/api/style-profile');
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { styleProfile: StyleProfile };
    return data.styleProfile;
  } catch {
    return null;
  }
};

/**
 * 리뷰 생성
 */
export const generateReview = async (
  payload: ReviewPayload,
): Promise<{ review: string; message: string }> => {
  const response = await fetch('/api/generate-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '리뷰 생성에 실패했습니다.');
  }

  return (await response.json()) as { review: string; message: string };
};

/**
 * 리뷰 수정
 */
export const editReview = async (
  review: string,
  request: string,
): Promise<string> => {
  const response = await fetch('/api/edit-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review, request }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '수정 요청을 처리하지 못했습니다.');
  }

  const data = (await response.json()) as { review: string };
  return data.review;
};

/**
 * 클립보드에 복사
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  if (!text || typeof navigator === 'undefined') return;
  await navigator.clipboard.writeText(text);
};

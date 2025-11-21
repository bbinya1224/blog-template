import type { ReviewPayload } from '@/entities/review/model/types';
import type { StyleProfile } from '@/entities/style-profile/model/types';
import { formatKoreanDate } from '@/shared/lib/utils';
import {
  generateReviewWithClaude,
  editReviewWithClaude,
} from '@/shared/api/claude-client';
import {
  REVIEW_ANALYSIS_PROMPT,
  REVIEW_USER_PROMPT,
  REVIEW_EDIT_PROMPT,
} from '@/shared/config/prompts';
import { AppError } from '@/shared/lib/errors';

export const buildReviewText = (
  payload: ReviewPayload,
  style: StyleProfile
): string => {
  const visitDate = formatKoreanDate(payload.date);

  // 1. 오프닝
  const opening = [
    `안녕하세요, 지난 ${visitDate}에 다녀온 ${payload.name} 이야기를 공유해볼게요.`,
    `${style.writing_style.formality} 톤으로 그날의 감정을 담아봤습니다.`,
  ].join(' ');

  // 2. 위치 정보
  const location = `${payload.name}은 ${payload.location}에 자리하고 있어서 ${
    payload.extra || '주말 산책 코스와도 잘 어울렸어요'
  }.`;

  // 3. 장점 하이라이트
  const defaultSection = style.structure_pattern.frequent_sections[2] || '메뉴';
  const highlight = payload.pros
    ? `특히 ${payload.pros} 부분이 가장 인상 깊었고, ${defaultSection} 파트에서 자연스럽게 추천할 수 있었어요.`
    : `${payload.name}만의 분위기가 은근히 계속 떠오르더라고요.`;

  // 4. 단점 (있는 경우)
  const drawbacks = payload.cons
    ? `솔직히 ${payload.cons} 부분은 조금 아쉬웠지만, 전체적인 경험에는 큰 영향을 주지 않았어요.`
    : '아쉬운 점을 찾기 힘들 만큼 전반적으로 균형 잡힌 경험이었습니다.';

  // 5. 한줄평
  const summary = `한줄평으로 정리하면 "${payload.summary}" 이 한 문장이 모든 것을 설명해주는 느낌입니다.`;

  // 6. 마무리
  const closing = `다음에 또 방문하게 된다면 ${
    payload.extra || '조금 더 느긋하게 머물고 싶다'
  }는 생각이 듭니다.`;

  return [opening, location, highlight, drawbacks, summary, closing].join(
    '\n\n'
  );
};

/**
 * 리뷰 수정 텍스트 생성 (순수 함수)
 * 기존 리뷰 + 수정 요청 + 스타일 노트를 조합
 */
export const buildEditedReview = (
  originalReview: string,
  editRequest: string,
  styleProfile: StyleProfile
): string => {
  const requestNote = `요청: ${editRequest}`;
  const styleNote = styleProfile.writing_style.style_notes;

  return `${originalReview.trim()}\n\n${styleNote}\n${requestNote}`;
};

/**
 * Claude API를 사용한 리뷰 생성
 * Claude Haiku가 스타일 프로필과 입력 데이터를 기반으로 리뷰 생성
 */
export const generateReviewWithClaudeAPI = async (
  payload: ReviewPayload,
  styleProfile: StyleProfile,
): Promise<string> => {
  try {
    const styleProfileJson = JSON.stringify(styleProfile, null, 2);

    const review = await generateReviewWithClaude(
      styleProfileJson,
      {
        name: payload.name,
        location: payload.location,
        date: formatKoreanDate(payload.date),
        summary: payload.summary,
        pros: payload.pros,
        cons: payload.cons,
        extra: payload.extra,
      },
      REVIEW_ANALYSIS_PROMPT,
      REVIEW_USER_PROMPT,
    );

    return review.trim();
  } catch (error) {
    console.error('리뷰 생성 상세 에러:', error);

    if (error instanceof AppError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error
        ? `리뷰 생성 중 오류: ${error.message}`
        : 'Claude API를 사용한 리뷰 생성 중 오류가 발생했습니다.';

    throw new AppError(errorMessage, 'REVIEW_GENERATION_ERROR', 500);
  }
};

/**
 * Claude API를 사용한 리뷰 수정
 * Claude Haiku가 기존 리뷰를 수정 요청에 따라 개선
 */
export const editReviewWithClaudeAPI = async (
  originalReview: string,
  editRequest: string,
  styleProfile: StyleProfile,
): Promise<string> => {
  try {
    const styleProfileJson = JSON.stringify(styleProfile, null, 2);

    const editedReview = await editReviewWithClaude(
      originalReview,
      editRequest,
      styleProfileJson,
      REVIEW_EDIT_PROMPT,
    );

    return editedReview.trim();
  } catch (error) {
    console.error('리뷰 수정 상세 에러:', error);

    if (error instanceof AppError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error
        ? `리뷰 수정 중 오류: ${error.message}`
        : 'Claude API를 사용한 리뷰 수정 중 오류가 발생했습니다.';

    throw new AppError(errorMessage, 'REVIEW_EDIT_ERROR', 500);
  }
};

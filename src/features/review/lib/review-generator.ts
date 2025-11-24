import fs from 'fs/promises';
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
import { BLOG_SAMPLES_PATH } from '@/shared/api/data-files';
import { searchStoreInfo } from '@/shared/lib/search'; // Tavily 검색 유틸

const getRandomWritingSamples = async (count: number = 3): Promise<string> => {
  try {
    const data = await fs.readFile(BLOG_SAMPLES_PATH, 'utf-8');
    let samples: string[];

    try {
      samples = JSON.parse(data);
    } catch {
      return '';
    }

    if (!Array.isArray(samples) || samples.length === 0) return '';

    return samples
      .sort(() => 0.5 - Math.random())
      .slice(0, count)
      .join('\n\n[Reference Sample]\n\n');
  } catch (error) {
    console.warn(`샘플 로드 실패 (${BLOG_SAMPLES_PATH}):`, error);
    return '';
  }
};

export const generateReviewWithClaudeAPI = async (
  payload: ReviewPayload,
  styleProfile: StyleProfile
): Promise<string> => {
  try {
    const styleProfileJson = JSON.stringify(styleProfile, null, 2);

    const searchQuery = `${payload.location} ${payload.name} 메뉴 가격 분위기 솔직 후기`;
    console.log(`\n[Review Gen] Tavily 검색 시작: "${searchQuery}"`);

    const [searchContext, writingSamples] = await Promise.all([
      searchStoreInfo(searchQuery).catch((err) => {
        console.error('❌ Tavily 검색 실패:', err.message || err);
        return '';
      }),
      getRandomWritingSamples(3),
    ]);

    console.log(
      `\n[Review Gen] 검색 결과: ${searchContext.length}자, 샘플: ${writingSamples.length}자`
    );

    if (searchContext.length > 0) {
      console.log(
        `\n[Review Gen] Tavily 검색 내용 (첫 200자):\n${searchContext.substring(
          0,
          200
        )}...`
      );
    } else {
      console.warn(
        '⚠️ [Review Gen] Tavily 검색 결과가 비어있습니다. 일반적인 리뷰로 생성됩니다.'
      );
    }

    if (writingSamples.length > 0) {
      console.log(
        `[Review Gen] 작성 샘플 개수: ${
          writingSamples.split('[Reference Sample]').length - 1
        }개`
      );
    } else {
      console.warn('⚠️ [Review Gen] 작성 샘플이 없습니다.');
    }

    console.log('\n[Review Gen] Claude API 호출 시작...');
    const review = await generateReviewWithClaude(
      styleProfileJson,
      {
        name: payload.name,
        location: payload.location,
        date: formatKoreanDate(payload.date),
        companion: payload.companion,
        menu: payload.menu,
        summary: payload.summary,
        pros: payload.pros,
        cons: payload.cons,
        extra: payload.extra,
        tavily_search_result_context:
          searchContext ||
          '검색된 정보가 없습니다. 일반적인 맛집 리뷰처럼 작성해주세요.',
        writing_samples:
          writingSamples ||
          '샘플 데이터가 없습니다. 스타일 프로필을 참고해주세요.',
      },
      REVIEW_ANALYSIS_PROMPT,
      REVIEW_USER_PROMPT
    );

    const trimmedReview = review.trim();
    console.log(`\n✅ [Review Gen] 리뷰 생성 완료: ${trimmedReview.length}자`);

    if (trimmedReview.length < 1500) {
      console.warn(
        `⚠️ [Review Gen] 생성된 리뷰가 1500자 미만입니다 (${trimmedReview.length}자). 프롬프트 조정이 필요할 수 있습니다.`
      );
    }

    return trimmedReview;
  } catch (error) {
    console.error('리뷰 생성 상세 에러:', error);
    if (error instanceof AppError) throw error;

    throw new AppError(
      error instanceof Error ? error.message : '알 수 없는 오류',
      'REVIEW_GENERATION_ERROR',
      500
    );
  }
};

export const editReviewWithClaudeAPI = async (
  originalReview: string,
  editRequest: string,
  styleProfile: StyleProfile
): Promise<string> => {
  try {
    const styleProfileJson = JSON.stringify(styleProfile, null, 2);
    const editedReview = await editReviewWithClaude(
      originalReview,
      editRequest,
      styleProfileJson,
      REVIEW_EDIT_PROMPT
    );
    return editedReview.trim();
  } catch (error) {
    console.error('리뷰 수정 에러:', error);
    if (error instanceof AppError) throw error;

    throw new AppError('리뷰 수정 중 오류 발생', 'REVIEW_EDIT_ERROR', 500);
  }
};

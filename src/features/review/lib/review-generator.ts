import type { ReviewPayload } from '@/entities/review/model/types';
import type { StyleProfile } from '@/entities/style-profile/model/types';
import { formatKoreanDate } from '@/shared/lib/utils';
import {
  generateReviewWithClaude,
  editReviewWithClaude,
} from '@/shared/api/claude-client';
import {
  getReviewGenerationPrompts,
  getReviewEditPrompt,
} from '@/shared/api/prompt-service';
import { AppError } from '@/shared/lib/errors';
import { readBlogSamples } from '@/shared/api/data-files';
import { searchStoreInfo } from '@/shared/lib/search';
import { formatNaverPlaceInfo } from '@/shared/lib/naver-search';

const getRandomWritingSamples = async (email: string, count: number = 3): Promise<string> => {
  try {
    const samples = await readBlogSamples(email);

    if (!Array.isArray(samples) || samples.length === 0) return '';

    return samples
      .sort(() => 0.5 - Math.random())
      .slice(0, count)
      .join('\n\n[Reference Sample]\n\n');
  } catch (error) {
    console.warn(`샘플 로드 실패 (DB):`, error);
    return '';
  }
};

export const generateReviewWithClaudeAPI = async (
  payload: ReviewPayload,
  styleProfile: StyleProfile,
  email?: string
): Promise<string> => {
  try {
    const styleProfileJson = JSON.stringify(styleProfile, null, 2);

    const searchQuery = `${payload.location} ${payload.name}`;
    console.log(`\n[Review Gen] 통합 검색 시작: "${searchQuery}"`);

    const [searchResult, writingSamples, prompts] = await Promise.all([
      searchStoreInfo(searchQuery).catch((err) => {
        console.error('❌ 통합 검색 실패:', err.message || err);
        return { naverPlace: null, tavilyContext: '' };
      }),
      email ? getRandomWritingSamples(email, 3) : Promise.resolve(''),
      getReviewGenerationPrompts(),
    ]);

    // 네이버 정보 포맷팅
    const naverPlaceFormatted = searchResult.naverPlace
      ? formatNaverPlaceInfo(searchResult.naverPlace)
      : '네이버 검색 결과 없음';

    const tavilyContext = searchResult.tavilyContext || '';

    console.log(
      `\n[Review Gen] 검색 결과:\n- 네이버: ${searchResult.naverPlace ? searchResult.naverPlace.name : '없음'}\n- Tavily: ${tavilyContext.length}자\n- 샘플: ${writingSamples.length}자`
    );

    if (tavilyContext.length > 0) {
      console.log(
        `\n[Review Gen] Tavily 검색 내용 (첫 200자):\n${tavilyContext.substring(
          0,
          200
        )}...`
      );
    } else {
      console.warn(
        '⚠️ [Review Gen] Tavily 검색 결과가 비어있습니다.'
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
        user_draft: payload.user_draft || '',
        naver_place_info: naverPlaceFormatted,
        tavily_search_result_context:
          tavilyContext ||
          '검색된 정보가 없습니다. 일반적인 맛집 리뷰처럼 작성해주세요.',
        writing_samples:
          writingSamples ||
          '샘플 데이터가 없습니다. 스타일 프로필을 참고해주세요.',
      },
      prompts.systemPrompt,
      prompts.userPrompt
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
    const [styleProfileJson, editPrompt] = await Promise.all([
      Promise.resolve(JSON.stringify(styleProfile, null, 2)),
      getReviewEditPrompt(),
    ]);

    const editedReview = await editReviewWithClaude(
      originalReview,
      editRequest,
      styleProfileJson,
      editPrompt
    );
    return editedReview.trim();
  } catch (error) {
    console.error('리뷰 수정 에러:', error);
    if (error instanceof AppError) throw error;

    throw new AppError('리뷰 수정 중 오류 발생', 'REVIEW_EDIT_ERROR', 500);
  }
};

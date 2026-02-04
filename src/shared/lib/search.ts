import { tavily } from '@tavily/core';
import { AppError } from '@/shared/lib/errors';
import { withTimeoutAndRetry } from '@/shared/lib/timeout';
import { searchKakaoPlace, type KakaoPlaceInfo } from './kakao-local';

let tavilyClient: ReturnType<typeof tavily> | null = null;

const getTavilyClient = () => {
  if (tavilyClient) {
    return tavilyClient;
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new AppError(
      'TAVILY_API_KEY 환경변수가 설정되지 않았습니다.',
      'MISSING_API_KEY',
      500,
    );
  }

  tavilyClient = tavily({ apiKey });
  return tavilyClient;
};

/**
 * 통합 검색 결과 타입
 */
export interface SearchResult {
  kakaoPlace: KakaoPlaceInfo | null;
  tavilyContext: string;
}

const TAVILY_TIMEOUT_MS = 30000;
const TAVILY_RETRY_OPTIONS = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  onRetry: (attempt: number, error: unknown) => {
    console.warn(`[Tavily] 재시도 ${attempt}회:`, error);
  },
};

/**
 * Tavily 검색 (블로그 리뷰 컨텍스트)
 */
async function searchTavilyContext(query: string): Promise<string> {
  try {
    console.log(`\n[Tavily] 검색 시작: "${query}"`);
    const client = getTavilyClient();

    const response = await withTimeoutAndRetry(
      () =>
        client.search(query, {
          searchDepth: 'basic',
          maxResults: 5,
          includeAnswer: true,
        }),
      TAVILY_TIMEOUT_MS,
      TAVILY_RETRY_OPTIONS,
    );

    console.log(`[Tavily] 검색 완료: ${response.results?.length || 0}개 결과`);

    if (!response.results || response.results.length === 0) {
      console.warn('[Tavily] 검색 결과가 없습니다.');
      return '';
    }

    const context = response.results
      .map((r, idx) => {
        console.log(`  [${idx + 1}] ${r.title} (${r.content?.length || 0}자)`);
        return `- 제목: ${r.title}\n- 내용: ${r.content}`;
      })
      .join('\n\n');

    console.log(`[Tavily] 최종 컨텍스트: ${context.length}자\n`);
    return context;
  } catch (error) {
    console.error('❌ [Tavily] 검색 실패 (재시도 후):', error);
    return ''; // 검색 실패 시 빈 문자열 반환
  }
}

/**
 * 통합 검색: 카카오 지역 정보 + Tavily 블로그 컨텍스트
 *
 * @param query - 검색 쿼리 (예: "성수동 대림창고")
 * @returns 카카오 장소 정보와 Tavily 컨텍스트를 포함한 검색 결과
 */
export async function searchStoreInfo(query: string): Promise<SearchResult> {
  console.log(`\n=== 통합 검색 시작: "${query}" ===`);

  // 카카오 + Tavily 병렬 검색
  const [kakaoPlace, tavilyContext] = await Promise.all([
    searchKakaoPlace(query),
    searchTavilyContext(query),
  ]);

  console.log('\n=== 통합 검색 완료 ===');
  console.log(`- 카카오: ${kakaoPlace ? kakaoPlace.name : '결과 없음'}`);
  console.log(
    `- Tavily: ${tavilyContext ? `${tavilyContext.length}자` : '결과 없음'}\n`,
  );

  return {
    kakaoPlace,
    tavilyContext,
  };
}

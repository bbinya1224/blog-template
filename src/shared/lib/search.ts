import { tavily } from '@tavily/core';
import { AppError } from '@/shared/lib/errors';

// Lazy initialization으로 빌드 시 에러 방지
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
      500
    );
  }

  tavilyClient = tavily({ apiKey });
  return tavilyClient;
};

export async function searchStoreInfo(query: string) {
  try {
    console.log(`\n[Tavily] 검색 시작: "${query}"`);
    const client = getTavilyClient();

    const response = await client.search(query, {
      searchDepth: 'basic',
      maxResults: 5,
      includeAnswer: true,
    });

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
    console.error('❌ [Tavily] 검색 실패:', error);
    return ''; // 검색 실패 시 빈 문자열 반환 (리뷰 생성은 진행)
  }
}

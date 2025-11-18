import { NextResponse } from 'next/server';
import { crawlBlogRss } from '@/lib/rss-crawler';
import { saveBlogPosts } from '@/lib/data-files';
import { validateAnalyzePayload } from '@/lib/validators';
import { AppError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    // 1. 요청 데이터 파싱
    const payload = await request.json();

    // 2. Validation (타입 가드)
    validateAnalyzePayload(payload);

    // 3. 크롤링 실행
    const { rssUrl, maxPosts = 20 } = payload;
    const blogContent = await crawlBlogRss(rssUrl, maxPosts);

    // 4. 파일 저장
    await saveBlogPosts(blogContent);

    // 5. 성공 응답
    return NextResponse.json({
      success: true,
      message: `RSS 피드에서 블로그 글을 성공적으로 가져왔습니다.`,
    });
  } catch (error) {
    console.error('RSS 크롤링 오류:', error);

    // AppError는 적절한 상태 코드와 메시지를 가지고 있음
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    // 예상치 못한 에러
    return NextResponse.json(
      { error: 'RSS 크롤링 중 예상치 못한 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

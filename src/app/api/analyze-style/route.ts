import { NextResponse } from 'next/server';
import { generateStyleProfileWithClaude } from '@/lib/style-analysis';
import { readBlogPosts, saveStyleProfile } from '@/lib/data-files';
import { AppError, NotFoundError } from '@/lib/errors';

export async function POST() {
  try {
    // 1. 저장된 블로그 글 읽기
    const blogText = await readBlogPosts();

    if (!blogText || blogText.trim().length === 0) {
      throw new NotFoundError(
        '분석할 블로그 글이 없습니다. 먼저 RSS를 불러와주세요.',
      );
    }

    // 2. Claude API로 스타일 분석
    const styleProfile = await generateStyleProfileWithClaude(blogText);

    // 3. 결과 저장
    await saveStyleProfile(styleProfile);

    // 4. 성공 응답
    return NextResponse.json({
      styleProfile,
      message: 'Claude API를 통한 스타일 분석이 완료되었습니다.',
    });
  } catch (error) {
    console.error('스타일 분석 오류:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: '스타일 분석 중 예상치 못한 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

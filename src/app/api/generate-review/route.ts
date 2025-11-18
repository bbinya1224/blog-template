import { NextResponse } from 'next/server';
import { generateReviewWithClaudeAPI } from '@/lib/review-generator';
import { readStyleProfile, saveReviewToFile } from '@/lib/data-files';
import { validateReviewPayload } from '@/lib/validators';
import { AppError, NotFoundError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    // 1. 요청 데이터 파싱 및 검증
    const payload = await request.json();
    validateReviewPayload(payload);

    // 2. 스타일 프로필 로드
    const styleProfile = await readStyleProfile();
    if (!styleProfile) {
      throw new NotFoundError(
        '스타일 프로필이 없습니다. 먼저 스타일 분석을 완료해주세요.',
      );
    }

    // 3. Claude API로 리뷰 생성
    const review = await generateReviewWithClaudeAPI(payload, styleProfile);

    // 4. 파일 저장
    const savedPath = await saveReviewToFile(review, payload);

    // 5. 성공 응답
    return NextResponse.json({
      review,
      message: `Claude API를 통한 리뷰 생성 및 저장 완료 (${savedPath})`,
    });
  } catch (error) {
    console.error('리뷰 생성 오류:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: '리뷰 생성 중 예상치 못한 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

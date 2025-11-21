import { NextResponse } from 'next/server';
import type { ReviewPayload } from '@/entities/review/model/types';
import type { StyleProfile } from '@/entities/style-profile/model/types';
import { AppError, NotFoundError } from '@/shared/lib/errors';

type GenerateReviewDeps = {
  validateReviewPayload: (payload: unknown) => payload is ReviewPayload;
  readStyleProfile: () => Promise<StyleProfile | null>;
  generateReview: (
    payload: ReviewPayload,
    styleProfile: StyleProfile,
  ) => Promise<string>;
  saveReviewToFile: (review: string, payload: ReviewPayload) => Promise<string>;
};

export const createGenerateReviewHandler = ({
  validateReviewPayload,
  readStyleProfile,
  generateReview,
  saveReviewToFile,
}: GenerateReviewDeps) => {
  return async (request: Request) => {
    try {
      const body: unknown = await request.json();

      if (!validateReviewPayload(body)) {
        throw new Error('Unreachable: validateReviewPayload throws on failure');
      }

      const payload = body;

      const styleProfile = await readStyleProfile();
      if (!styleProfile) {
        throw new NotFoundError(
          '스타일 프로필이 없습니다. 먼저 스타일 분석을 완료해주세요.',
        );
      }

      const review = await generateReview(payload, styleProfile);
      const savedPath = await saveReviewToFile(review, payload);

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
  };
};

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import type { ReviewEditPayload } from '@/entities/review/model/types';
import type { StyleProfile } from '@/entities/style-profile/model/types';
import { AppError, NotFoundError } from '@/shared/lib/errors';

type EditReviewDeps = {
  validateEditRequest: (payload: unknown) => payload is ReviewEditPayload;
  readStyleProfile: (email: string) => Promise<StyleProfile | null>;
  editReview: (
    originalReview: string,
    editRequest: string,
    styleProfile: StyleProfile,
  ) => Promise<string>;
};

export const createEditReviewHandler = ({
  validateEditRequest,
  readStyleProfile,
  editReview,
}: EditReviewDeps) => {
  return async (request: Request) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.email) {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 },
        );
      }

      const body: unknown = await request.json();

      // validateEditRequest는 유효하지 않으면 ValidationError를 던짐
      // 성공하면 body는 ReviewEditPayload로 타입이 좁혀짐
      if (!validateEditRequest(body)) {
        // 이 코드는 실행되지 않지만 타입 가드를 위해 필요
        throw new Error('Unreachable: validateEditRequest throws on failure');
      }

      const { review: originalReview, request: editRequest } = body;

      const styleProfile = await readStyleProfile(session.user.email);
      if (!styleProfile) {
        throw new NotFoundError(
          '스타일 프로필을 찾을 수 없습니다. 먼저 스타일 분석을 완료해주세요.',
        );
      }

      const review = await editReview(originalReview, editRequest, styleProfile);

      return NextResponse.json({
        review,
        message: 'Claude API를 통한 리뷰 수정이 완료되었습니다.',
      });
    } catch (error) {
      console.error('리뷰 수정 오류:', error);

      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode },
        );
      }

      return NextResponse.json(
        { error: '리뷰 수정 중 예상치 못한 오류가 발생했습니다.' },
        { status: 500 },
      );
    }
  };
};

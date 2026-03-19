import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import type { ReviewEditPayload } from '@/shared/types/review';
import type { StyleProfile } from '@/shared/types/styleProfile';
import { AppError, NotFoundError } from '@/shared/lib/errors';
import { ApiResponse } from '@/shared/api/response';

type EditReviewDeps = {
  validateEditRequest: (payload: unknown) => payload is ReviewEditPayload;
  readStyleProfile: (email: string) => Promise<StyleProfile | null>;
  editReview: (
    originalReview: string,
    editRequest: string,
    styleProfile: StyleProfile,
  ) => Promise<string>;
  incrementUsageCount?: (email: string) => Promise<void>;
};

export const createEditReviewHandler = ({
  validateEditRequest,
  readStyleProfile,
  editReview,
  incrementUsageCount,
}: EditReviewDeps) => {
  return async (request: Request) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.email) {
        return ApiResponse.unauthorized();
      }

      const body: unknown = await request.json();

      if (!validateEditRequest(body)) {
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

      await incrementUsageCount?.(session.user.email);

      return ApiResponse.success({ review }, 'Claude API를 통한 리뷰 수정이 완료되었습니다.');
    } catch (error) {
      console.error('리뷰 수정 오류:', error);

      if (error instanceof AppError) {
        return ApiResponse.error(error.code, error.message, error.statusCode);
      }

      return ApiResponse.serverError('리뷰 수정 중 예상치 못한 오류가 발생했습니다.');
    }
  };
};

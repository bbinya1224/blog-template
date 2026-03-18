import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import type { ReviewPayload } from '@/shared/types/review';
import type { StyleProfile } from '@/shared/types/styleProfile';
import { AppError, NotFoundError } from '@/shared/lib/errors';
import { ApiResponse } from '@/shared/api/response';

type GenerateReviewDeps = {
  validateReviewPayload: (payload: unknown) => payload is ReviewPayload;
  readStyleProfile: (email: string) => Promise<StyleProfile | null>;
  generateReview: (
    payload: ReviewPayload,
    styleProfile: StyleProfile,
    email?: string
  ) => Promise<string>;
  saveReviewToDB: (email: string, review: string, payload: ReviewPayload) => Promise<string>;
  getUserStatus: (email: string) => Promise<{ is_preview: boolean | null; usage_count: number | null } | null>;
  incrementUsageCount: (email: string) => Promise<void>;
};

export const createGenerateReviewHandler = ({
  validateReviewPayload,
  readStyleProfile,
  generateReview,
  saveReviewToDB,
  getUserStatus,
  incrementUsageCount,
}: GenerateReviewDeps) => {
  return async (request: Request) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return ApiResponse.unauthorized();
      }
      const email = session.user.email;

      // 1. Check Usage Quota
      const status = await getUserStatus(email);
      if (status?.is_preview && (status.usage_count || 0) >= 2) {
        return ApiResponse.quotaExceeded();
      }

      const body: unknown = await request.json();

      if (!validateReviewPayload(body)) {
        throw new Error('Unreachable: validateReviewPayload throws on failure');
      }

      const payload = body;

      const styleProfile = await readStyleProfile(email);
      if (!styleProfile) {
        throw new NotFoundError(
          '스타일 프로필이 없습니다. 먼저 스타일 분석을 완료해주세요.',
        );
      }

      const review = await generateReview(payload, styleProfile, email);
      const savedId = await saveReviewToDB(email, review, payload);

      // 2. Increment Usage Count
      await incrementUsageCount(email);

      return ApiResponse.success({ review, message: `리뷰 생성 및 저장 완료 (ID: ${savedId})` });
    } catch (error) {
      console.error('리뷰 생성 오류:', error);

      if (error instanceof AppError) {
        return ApiResponse.error(error.code || 'INTERNAL_ERROR', error.message, error.statusCode);
      }

      return ApiResponse.serverError('리뷰 생성 중 예상치 못한 오류가 발생했습니다.');
    }
  };
};

import { ApiResponse } from '@/shared/api/response';
import {
  withAuth,
  withQuota,
  type AuthenticatedRequest,
} from '@/shared/api/middleware';

type UpdateReviewDeps = {
  updateReview: (id: string, content: string) => Promise<void>;
  incrementUsageCount: (email: string) => Promise<void>;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const createUpdateReviewHandler = (deps: UpdateReviewDeps) => {
  const handler = async (
    request: AuthenticatedRequest,
    context?: RouteContext
  ): Promise<Response> => {
    try {
      if (!context) {
        return ApiResponse.validationError('잘못된 요청입니다.');
      }
      const { id } = await context.params;
      const { content } = await request.json();

      if (!content) {
        return ApiResponse.validationError('content는 필수입니다.');
      }

      await deps.updateReview(decodeURIComponent(id), content);
      await deps.incrementUsageCount(request.user.email);

      return ApiResponse.success({ id }, '리뷰가 수정되었습니다.');
    } catch (error) {
      console.error('리뷰 업데이트 오류:', error);
      return ApiResponse.serverError('리뷰 수정에 실패했습니다.');
    }
  };

  // 미들웨어 적용: 인증 → 쿼터 체크 → 핸들러
  return withAuth(withQuota(handler));
};

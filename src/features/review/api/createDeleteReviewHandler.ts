import { ApiResponse } from '@/shared/api/response';
import {
  withAuth,
  type AuthenticatedRequest,
} from '@/shared/api/middleware';

type DeleteReviewDeps = {
  deleteReview: (id: string, userEmail: string) => Promise<void>;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const createDeleteReviewHandler = (deps: DeleteReviewDeps) => {
  const handler = async (
    request: AuthenticatedRequest,
    context?: RouteContext
  ): Promise<Response> => {
    try {
      if (!context) {
        return ApiResponse.validationError('잘못된 요청입니다.');
      }
      const { id } = await context.params;

      let decodedId: string;
      try {
        decodedId = decodeURIComponent(id);
      } catch {
        return ApiResponse.validationError('잘못된 리뷰 ID입니다.');
      }

      await deps.deleteReview(decodedId, request.user.email);

      return ApiResponse.success({ id: decodedId }, '리뷰가 삭제되었습니다.');
    } catch (error) {
      console.error('리뷰 삭제 오류:', error);
      return ApiResponse.serverError('리뷰 삭제에 실패했습니다.');
    }
  };

  return withAuth(handler);
};

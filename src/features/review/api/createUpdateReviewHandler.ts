import { ApiResponse } from '@/shared/api/response';
import {
  withAuth,
  withQuota,
  type AuthenticatedRequest,
} from '@/shared/api/middleware';
import type { ConversationMessage } from '@/entities/review';

type UpdateReviewDeps = {
  updateReview: (
    id: string,
    content: string,
    conversation?: ConversationMessage[],
  ) => Promise<void>;
  incrementUsageCount: (email: string) => Promise<void>;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isValidConversation(value: unknown): value is ConversationMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (msg) =>
        typeof msg === 'object' &&
        msg !== null &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string' &&
        typeof msg.type === 'string',
    )
  );
}

export const createUpdateReviewHandler = (deps: UpdateReviewDeps) => {
  const handler = async (
    request: AuthenticatedRequest,
    context?: RouteContext,
  ): Promise<Response> => {
    try {
      if (!context) {
        return ApiResponse.validationError('잘못된 요청입니다.');
      }
      const { id } = await context.params;
      const body = await request.json();
      const { content, conversation } = body as {
        content?: unknown;
        conversation?: unknown;
      };

      if (typeof content !== 'string' || !content.trim()) {
        return ApiResponse.validationError('content는 필수입니다.');
      }

      if (conversation !== undefined && !isValidConversation(conversation)) {
        return ApiResponse.validationError(
          'conversation 형식이 올바르지 않습니다.',
        );
      }

      const validatedConversation =
        conversation !== undefined
          ? (conversation as ConversationMessage[])
          : undefined;

      await deps.updateReview(
        decodeURIComponent(id),
        content,
        validatedConversation,
      );
      await deps.incrementUsageCount(request.user.email);

      return ApiResponse.success({ id }, '리뷰가 수정되었습니다.');
    } catch (error) {
      console.error('리뷰 업데이트 오류:', error);
      return ApiResponse.serverError('리뷰 수정에 실패했습니다.');
    }
  };

  return withAuth(withQuota(handler));
};

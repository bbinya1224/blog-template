import { withAuth, type AuthenticatedRequest } from '@/shared/api/middleware';
import { getReviews } from '@/entities/review/api';
import { ApiResponse } from '@/shared/api/response';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const limitParam = new URL(request.url).searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;

    const reviews = await getReviews(request.user.email, limit);
    return ApiResponse.success(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return ApiResponse.serverError();
  }
});

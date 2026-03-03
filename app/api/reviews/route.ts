import { type NextRequest } from 'next/server';
import { getReviews } from '@/entities/review/api';
import { ApiResponse } from '@/shared/api/response';

export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;

    const reviews = await getReviews(limit);
    return ApiResponse.success(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return ApiResponse.serverError();
  }
}

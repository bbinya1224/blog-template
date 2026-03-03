import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { searchStoreInfo } from '@/shared/lib/search';
import { ApiResponse } from '@/shared/api/response';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return ApiResponse.unauthorized();
    }

    let body: { query?: unknown };
    try {
      body = await request.json();
    } catch {
      return ApiResponse.validationError('잘못된 요청 형식입니다.');
    }

    const { query } = body;

    if (!query || typeof query !== 'string') {
      return ApiResponse.validationError('검색어를 입력해주세요.');
    }

    const result = await searchStoreInfo(query);

    return ApiResponse.success(result);
  } catch (error) {
    console.error('Place search error:', error);
    return ApiResponse.serverError();
  }
}

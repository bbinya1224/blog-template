import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { readStyleProfile } from '@/shared/api/data-files';
import { ApiResponse } from '@/shared/api/response';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return ApiResponse.unauthorized();
    }

    const styleProfile = await readStyleProfile(session.user.email);
    if (!styleProfile) {
      return ApiResponse.notFound('스타일 프로필이 없습니다.');
    }

    return ApiResponse.success({ styleProfile });
  } catch (error) {
    console.error('스타일 프로필 조회 오류:', error);
    return ApiResponse.serverError();
  }
}

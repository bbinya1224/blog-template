import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import type { StyleProfile } from '@/shared/types/styleProfile';
import { AppError, NotFoundError } from '@/shared/lib/errors';
import { ApiResponse } from '@/shared/api/response';

type AnalyzeStyleDeps = {
  readBlogPosts: (email: string) => Promise<string>;
  generateStyleProfile: (blogText: string) => Promise<StyleProfile>;
  saveStyleProfile: (email: string, profile: StyleProfile) => Promise<void>;
};

export const createAnalyzeStyleHandler = ({
  readBlogPosts,
  generateStyleProfile,
  saveStyleProfile,
}: AnalyzeStyleDeps) => {
  return async () => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return ApiResponse.unauthorized();
      }
      const email = session.user.email;

      const blogText = await readBlogPosts(email);

      if (!blogText || blogText.trim().length === 0) {
        throw new NotFoundError(
          '분석할 블로그 글이 없습니다. 먼저 RSS를 불러와주세요.',
        );
      }

      const styleProfile = await generateStyleProfile(blogText);
      await saveStyleProfile(email, styleProfile);

      return ApiResponse.success({ styleProfile, message: 'Claude API를 통한 스타일 분석이 완료되었습니다.' });
    } catch (error) {
      console.error('스타일 분석 오류:', error);

      if (error instanceof AppError) {
        return ApiResponse.error(error.code, error.message, error.statusCode);
      }

      return ApiResponse.serverError('스타일 분석 중 예상치 못한 오류가 발생했습니다.');
    }
  };
};

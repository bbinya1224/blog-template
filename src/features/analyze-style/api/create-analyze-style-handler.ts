import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import type { StyleProfile } from '@/entities/style-profile/model/types';
import { AppError, NotFoundError } from '@/shared/lib/errors';

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
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 },
        );
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

      return NextResponse.json({
        styleProfile,
        message: 'Claude API를 통한 스타일 분석이 완료되었습니다.',
      });
    } catch (error) {
      console.error('스타일 분석 오류:', error);

      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode },
        );
      }

      return NextResponse.json(
        { error: '스타일 분석 중 예상치 못한 오류가 발생했습니다.' },
        { status: 500 },
      );
    }
  };
};

import { NextResponse } from 'next/server';
import type { StyleProfile } from '@/entities/style-profile/model/types';
import { AppError, NotFoundError } from '@/shared/lib/errors';

type AnalyzeStyleDeps = {
  readBlogPosts: () => Promise<string>;
  generateStyleProfile: (blogText: string) => Promise<StyleProfile>;
  saveStyleProfile: (profile: StyleProfile) => Promise<void>;
};

export const createAnalyzeStyleHandler = ({
  readBlogPosts,
  generateStyleProfile,
  saveStyleProfile,
}: AnalyzeStyleDeps) => {
  return async () => {
    try {
      const blogText = await readBlogPosts();

      if (!blogText || blogText.trim().length === 0) {
        throw new NotFoundError(
          '분석할 블로그 글이 없습니다. 먼저 RSS를 불러와주세요.',
        );
      }

      const styleProfile = await generateStyleProfile(blogText);
      await saveStyleProfile(styleProfile);

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

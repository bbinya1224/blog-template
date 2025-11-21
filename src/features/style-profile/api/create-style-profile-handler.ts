import { NextResponse } from 'next/server';
import type { StyleProfile } from '@/entities/style-profile/model/types';

type StyleProfileHandlerDeps = {
  readStyleProfile: () => Promise<StyleProfile | null>;
};

export const createStyleProfileGetHandler = ({
  readStyleProfile,
}: StyleProfileHandlerDeps) => {
  return async () => {
    const styleProfile = await readStyleProfile();

    if (!styleProfile) {
      return NextResponse.json(
        { error: '스타일 프로필이 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ styleProfile });
  };
};

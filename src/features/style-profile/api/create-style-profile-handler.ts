import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth';
import type { StyleProfile } from '@/entities/style-profile/model/types';

type StyleProfileHandlerDeps = {
  readStyleProfile: (email: string) => Promise<StyleProfile | null>;
};

export const createStyleProfileGetHandler = ({
  readStyleProfile,
}: StyleProfileHandlerDeps) => {
  return async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const styleProfile = await readStyleProfile(session.user.email);

    if (!styleProfile) {
      return NextResponse.json(
        { error: '스타일 프로필이 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ styleProfile });
  };
};

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { updateReview } from '@/entities/review/api/review-repository';
import { getUserStatus, incrementUsageCount } from '@/shared/api/data-files';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: NextRequest, { params }: Props) {
  try {
    // 1. 인증 체크
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    const email = session.user.email;

    // 2. Preview 모드 횟수 체크
    const status = await getUserStatus(email);
    if (status?.is_preview && (status.usage_count || 0) >= 2) {
      return NextResponse.json(
        { error: 'QUOTA_EXCEEDED: 무료 체험 횟수가 만료되었습니다. 후원 후 계속 이용해주세요!' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    await updateReview(decodeURIComponent(id), content);

    // 3. 횟수 차감 (수정도 생성과 동일하게 카운트)
    await incrementUsageCount(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

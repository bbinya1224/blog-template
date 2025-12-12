import { NextRequest, NextResponse } from 'next/server';
import { updateReview } from '@/entities/review/api/review-repository';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    await updateReview(decodeURIComponent(id), content);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

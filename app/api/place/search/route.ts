import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { searchStoreInfo } from '@/shared/lib/search';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    let body: { query?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: '검색어를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await searchStoreInfo(query);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Place search error:', error);
    return NextResponse.json(
      { error: '장소 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { searchStoreInfo } from '@/shared/lib/search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

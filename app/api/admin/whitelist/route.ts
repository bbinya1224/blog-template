import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';

/**
 * 관리자 비밀번호 검증
 */
function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD가 설정되지 않았습니다');
    return false;
  }

  return password === adminPassword;
}

/**
 * GET /api/admin/whitelist
 * 화이트리스트 전체 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 비밀번호 확인
    const password = request.headers.get('X-Admin-Password');

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: '인증 실패' },
        { status: 401 }
      );
    }

    // 화이트리스트 조회
    const { data, error } = await supabaseAdmin
      .from('approved_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('화이트리스트 조회 실패:', error);
      return NextResponse.json(
        { error: '조회 실패' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: data });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/whitelist
 * 화이트리스트에 이메일 추가
 */
export async function POST(request: NextRequest) {
  try {
    // 비밀번호 확인
    const password = request.headers.get('X-Admin-Password');

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: '인증 실패' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { email, notes } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: '이메일이 필요합니다' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '유효하지 않은 이메일 형식' },
        { status: 400 }
      );
    }

    // 중복 확인
    const { data: existing } = await supabaseAdmin
      .from('approved_users')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: '이미 존재하는 이메일입니다' },
        { status: 409 }
      );
    }

    // 추가
    const { error } = await supabaseAdmin
      .from('approved_users')
      .insert({
        email,
        notes: notes || '관리자 수동 승인',
      });

    if (error) {
      console.error('화이트리스트 추가 실패:', error);
      return NextResponse.json(
        { error: '추가 실패' },
        { status: 500 }
      );
    }

    console.log(`✅ 관리자가 추가함: ${email}`);
    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/whitelist
 * 화이트리스트에서 이메일 제거
 */
export async function DELETE(request: NextRequest) {
  try {
    // 비밀번호 확인
    const password = request.headers.get('X-Admin-Password');

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: '인증 실패' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: '이메일이 필요합니다' },
        { status: 400 }
      );
    }

    // 삭제
    const { error } = await supabaseAdmin
      .from('approved_users')
      .delete()
      .eq('email', email);

    if (error) {
      console.error('화이트리스트 제거 실패:', error);
      return NextResponse.json(
        { error: '제거 실패' },
        { status: 500 }
      );
    }

    console.log(`❌ 관리자가 제거함: ${email}`);
    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    );
  }
}

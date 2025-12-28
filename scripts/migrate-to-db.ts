import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Supabase 클라이언트 생성
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL과 SUPABASE_SERVICE_KEY가 필요합니다');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 사용자 이메일 (마이그레이션할 데이터의 소유자)
const USER_EMAIL = process.env.MIGRATION_USER_EMAIL || 'bbinya1224@gmail.com';

/**
 * 1. 스타일 프로필 마이그레이션
 */
async function migrateStyleProfile() {
  console.log('\n📝 스타일 프로필 마이그레이션 시작...');

  const stylePath = path.join(process.cwd(), 'data/styles/my-style.json');

  if (!fs.existsSync(stylePath)) {
    console.log('⚠️  스타일 파일이 없습니다. 건너뜁니다.');
    return;
  }

  try {
    const styleData = JSON.parse(fs.readFileSync(stylePath, 'utf-8'));

    // 기존 스타일 확인
    const { data: existing } = await supabase
      .from('user_styles')
      .select('id')
      .eq('user_email', USER_EMAIL)
      .single();

    if (existing) {
      // 업데이트
      const { error } = await supabase
        .from('user_styles')
        .update({
          style_data: styleData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_email', USER_EMAIL);

      if (error) throw error;
      console.log('✅ 스타일 프로필 업데이트 완료');
    } else {
      // 새로 추가
      const { error } = await supabase
        .from('user_styles')
        .insert({
          user_email: USER_EMAIL,
          style_data: styleData,
        });

      if (error) throw error;
      console.log('✅ 스타일 프로필 추가 완료');
    }
  } catch (error) {
    console.error('❌ 스타일 마이그레이션 실패:', error);
  }
}

/**
 * 2. 리뷰 마이그레이션
 */
async function migrateReviews() {
  console.log('\n📝 리뷰 마이그레이션 시작...');

  const reviewsDir = path.join(process.cwd(), 'data/reviews');

  if (!fs.existsSync(reviewsDir)) {
    console.log('⚠️  리뷰 폴더가 없습니다. 건너뜁니다.');
    return;
  }

  const files = fs.readdirSync(reviewsDir).filter((f) => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('⚠️  리뷰 파일이 없습니다.');
    return;
  }

  console.log(`📄 ${files.length}개의 리뷰 파일 발견`);

  for (const file of files) {
    try {
      const filePath = path.join(reviewsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // 파일명에서 정보 추출: 맛집이름_2025-12-20.md
      // 정규식 수정: 파일명에 다양한 문자가 있을 수 있으므로 좀 더 유연하게
      // 마지막 날짜 패턴(_YYYY-MM-DD)을 기준으로 앞부분을 이름으로 간주
      const match = file.match(/^(.+)_(\d{4}-\d{2}-\d{2})\.md$/);

      if (!match) {
        console.log(`⚠️  파일명 형식 오류: ${file} (건너뜀)`);
        continue;
      }

      const [, restaurantName, visitDate] = match;

      // DB에 삽입
      const { error } = await supabase.from('user_reviews').insert({
        user_email: USER_EMAIL,
        restaurant_name: restaurantName,
        visit_date: visitDate,
        review_content: content,
        metadata: {},
      });

      if (error) {
        // 중복 체크 (같은 가게, 같은 날짜)
        if (error.code === '23505') {
          console.log(`⚠️  중복: ${file} (건너뜀)`);
        } else {
          throw error;
        }
      } else {
        console.log(`✅ ${file} 마이그레이션 완료`);
      }
    } catch (error) {
      console.error(`❌ ${file} 마이그레이션 실패:`, error);
    }
  }

  console.log(`\n✅ 리뷰 마이그레이션 완료 (${files.length}개 처리 시도)`);
}

/**
 * 3. RSS 컨텐츠 마이그레이션 (선택사항)
 */
async function migrateRSSContent() {
  console.log('\n📝 RSS 컨텐츠 마이그레이션 시작...');

  const samplesPath = path.join(process.cwd(), 'data/rss-content/blog-samples.json');

  if (!fs.existsSync(samplesPath)) {
    console.log('⚠️  RSS 샘플 파일이 없습니다. 건너뜁니다.');
    return;
  }

  try {
    const samples = JSON.parse(fs.readFileSync(samplesPath, 'utf-8'));

    if (!Array.isArray(samples) || samples.length === 0) {
      console.log('⚠️  RSS 샘플이 비어있습니다.');
      return;
    }

    console.log(`📄 ${samples.length}개의 RSS 샘플 발견`);

    for (const sample of samples) {
      let title = 'Untitled';
      let content = '';
      let publishedDate = new Date().toISOString();
      let url = null;

      if (typeof sample === 'string') {
        content = sample;
        // 첫 줄을 제목으로 시도
        const firstLine = sample.split('\n')[0];
        if (firstLine && firstLine.length < 100) {
          title = firstLine;
        }
      } else {
        title = sample.title || 'Untitled';
        content = sample.content;
        publishedDate = sample.published_date || new Date().toISOString();
        url = sample.url || null;
      }
      
      if (!content) {
         console.log('⚠️  컨텐츠가 비어있음 (건너뜀)');
         continue;
      }

      const { error } = await supabase.from('rss_contents').insert({
        user_email: USER_EMAIL,
        title: title,
        content: content,
        published_date: publishedDate,
        url: url,
      });

      if (error && error.code !== '23505') {
        console.error('❌ RSS 샘플 추가 실패:', error);
      }
    }

    console.log('✅ RSS 컨텐츠 마이그레이션 완료');
  } catch (error) {
    console.error('❌ RSS 마이그레이션 실패:', error);
  }
}

/**
 * 메인 실행
 */
async function main() {
  console.log('🚀 데이터 마이그레이션 시작');
  console.log(`👤 사용자: ${USER_EMAIL}\n`);

  // 1. 사용자가 화이트리스트에 있는지 확인
  const { data: user, error: userError } = await supabase
    .from('approved_users')
    .select('email')
    .eq('email', USER_EMAIL)
    .single();

  if (userError || !user) {
    console.error(`❌ ${USER_EMAIL}이 화이트리스트에 없습니다!`);
    console.log('💡 먼저 관리자 페이지(http://localhost:3000/admin)에서 이메일을 추가하세요.');
    process.exit(1);
  }

  console.log('✅ 사용자 확인 완료\n');

  // 2. 마이그레이션 실행
  await migrateStyleProfile();
  await migrateReviews();
  await migrateRSSContent();

  console.log('\n🎉 모든 마이그레이션 완료!');
}

// 실행
main().catch((error) => {
  console.error('❌ 마이그레이션 중 오류 발생:', error);
  process.exit(1);
});

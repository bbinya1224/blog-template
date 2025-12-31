-- ============================================
-- Blog Review Generator - Supabase Schema
-- ============================================
-- 생성일: 2025-12-23
-- 설명: Buy Me a Coffee 후원 기반 블로그 리뷰 생성 서비스의 데이터베이스 스키마
-- ============================================

-- 1. 화이트리스트 테이블 (승인된 사용자)
-- Buy Me a Coffee로 후원한 사용자만 서비스 이용 가능
CREATE TABLE approved_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bmac_transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 검색 최적화를 위한 인덱스
CREATE INDEX idx_approved_users_email ON approved_users(email);

COMMENT ON TABLE approved_users IS '후원을 통해 승인된 사용자 목록';
COMMENT ON COLUMN approved_users.email IS '사용자 이메일 (Google 로그인 시 사용)';
COMMENT ON COLUMN approved_users.bmac_transaction_id IS 'Buy Me a Coffee 트랜잭션 ID';
COMMENT ON COLUMN approved_users.notes IS '관리자 메모 (수동 승인 사유 등)';

-- ============================================

-- 2. 사용자 스타일 프로필 테이블
-- 네이버 블로그 RSS 분석으로 생성된 사용자별 글쓰기 스타일
CREATE TABLE user_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL REFERENCES approved_users(email) ON DELETE CASCADE,
  blog_name VARCHAR(255),
  style_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자당 하나의 스타일만 허용
CREATE UNIQUE INDEX idx_user_styles_email ON user_styles(user_email);

COMMENT ON TABLE user_styles IS '사용자별 블로그 글쓰기 스타일 프로필';
COMMENT ON COLUMN user_styles.blog_name IS '분석한 블로그 이름';
COMMENT ON COLUMN user_styles.style_data IS 'Claude AI가 분석한 스타일 데이터 (JSON)';

-- ============================================

-- 3. 사용자 리뷰 테이블
-- AI로 생성된 맛집 리뷰 저장
CREATE TABLE user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL REFERENCES approved_users(email) ON DELETE CASCADE,
  restaurant_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  visit_date DATE,
  review_content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자별 리뷰 조회 최적화
CREATE INDEX idx_user_reviews_email ON user_reviews(user_email);
-- 최신 리뷰 조회 최적화
CREATE INDEX idx_user_reviews_created_at ON user_reviews(created_at DESC);

COMMENT ON TABLE user_reviews IS 'AI로 생성된 맛집 리뷰';
COMMENT ON COLUMN user_reviews.restaurant_name IS '가게 이름';
COMMENT ON COLUMN user_reviews.location IS '가게 위치';
COMMENT ON COLUMN user_reviews.visit_date IS '방문 날짜';
COMMENT ON COLUMN user_reviews.review_content IS '생성된 리뷰 전문 (Markdown)';
COMMENT ON COLUMN user_reviews.metadata IS '추가 메타데이터 (메뉴, 평점, 동행인 등)';

-- ============================================

-- 4. RSS 크롤링 데이터 테이블
-- 네이버 블로그에서 크롤링한 원본 글 저장 (선택 사항)
CREATE TABLE rss_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL REFERENCES approved_users(email) ON DELETE CASCADE,
  title VARCHAR(500),
  content TEXT NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE,
  url VARCHAR(1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rss_contents_email ON rss_contents(user_email);
CREATE INDEX idx_rss_contents_published_date ON rss_contents(published_date DESC);

COMMENT ON TABLE rss_contents IS '네이버 블로그 RSS 크롤링 데이터';
COMMENT ON COLUMN rss_contents.title IS '블로그 글 제목';
COMMENT ON COLUMN rss_contents.content IS '블로그 글 본문';
COMMENT ON COLUMN rss_contents.url IS '원본 블로그 글 URL';

-- ============================================

-- 5. updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = pg_catalog, public;

COMMENT ON FUNCTION update_updated_at_column() IS '테이블의 updated_at 컬럼을 자동으로 업데이트 (보안 강화됨)';

-- user_styles 테이블에 트리거 적용
CREATE TRIGGER update_user_styles_updated_at
  BEFORE UPDATE ON user_styles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- user_reviews 테이블에 트리거 적용
CREATE TRIGGER update_user_reviews_updated_at
  BEFORE UPDATE ON user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================

-- 6. 샘플 데이터 (개발/테스트용)
-- 실제 프로덕션에서는 주석 처리하세요!

/*
INSERT INTO approved_users (email, notes)
VALUES
  ('test@example.com', '개발용 테스트 계정'),
  ('admin@example.com', '관리자 계정');

INSERT INTO user_styles (user_email, blog_name, style_data)
VALUES (
  'test@example.com',
  '테스트 블로그',
  '{"tone": "친근함", "length": "중간", "emoji_usage": "보통"}'::jsonb
);

INSERT INTO user_reviews (user_email, restaurant_name, location, visit_date, review_content, metadata)
VALUES (
  'test@example.com',
  '테스트 카페',
  '서울 강남구',
  '2025-12-23',
  '# 테스트 카페 후기\n\n오늘 다녀온 테스트 카페는 정말 좋았어요!',
  '{"menu": "아메리카노", "rating": 5}'::jsonb
);
*/

-- ============================================
-- 스키마 생성 완료!
-- ============================================

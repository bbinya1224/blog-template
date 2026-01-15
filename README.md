# 블로그 톤 기반 리뷰 자동 생성 도구

내 블로그 문체를 학습해 **1500자 이상**의 리뷰를 자동으로 만들어주는 AI 기반 웹 서비스입니다.  
맛집 전용 리뷰로 작업하고있어요. 🤭

## 📢 Release Note (2026.01.14)

> 카카오 로컬 API 추가! 상업적 이용이 가능한 카카오 로컬 검색으로 전화번호, 주소 등 공식 정보가 자동으로 리뷰에 포함됩니다.
>
> 👉 [자세한 변경사항 보기 (CHANGELOG)](./CHANGELOG.md)

## ✨ 주요 기능

- 📝 네이버 블로그 RSS 분석으로 나만의 문체 학습
- 🔍 **카카오 로컬 검색 + Tavily로 실제 가게 정보 자동 수집**
  - 📍 전화번호, 주소, 카테고리 등 구조화된 정보
  - 🌐 블로그 리뷰 및 추가 컨텍스트
- 🤖 Claude AI로 내 말투를 흉내낸 1500~2000자 리뷰 생성
- 🎨 생성된 리뷰 실시간 수정 및 복사
- ☁️ Vercel에 배포된 웹 서비스

## 🚀 빠른 시작

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 생성:

```bash
cp .env.example .env.local
```

다음 API 키를 발급받아 `.env.local`에 추가:

```env
# 필수 API 키
ANTHROPIC_API_KEY=your_anthropic_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# 선택 API 키 (한국 로컬 비즈니스 정보 강화)
KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
```

**API 키 발급**:

- **Anthropic** (Claude AI): https://console.anthropic.com/
  - 용도: 스타일 분석 + 리뷰 생성
- **Tavily** (검색): https://tavily.com/
  - 용도: 블로그 리뷰 및 일반 가게 정보 검색
  - 무료: 월 1,000회
- **Kakao** (선택, 로컬 검색): https://developers.kakao.com/
  - 용도: 한국 로컬 비즈니스 정보 (전화번호, 주소, 카테고리)
  - 무료: 월 300,000회
  - ⚠️ 없어도 앱은 정상 동작 (Tavily만 사용)

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 📖 사용 방법

### 로컬 개발 환경

#### 1단계: 스타일 분석 (`/analyze`)

1. 네이버 블로그 RSS URL 입력 (예: `https://rss.blog.naver.com/YOUR_BLOG.xml`)
2. 분석할 최근 글 개수 선택 (권장: 10~20개)
3. 크롤링 및 분석 완료 대기
4. 생성된 스타일 프로필 확인

#### 2단계: 리뷰 생성 (`/generate`)

1. **기본 정보**: 가게명, 위치, 방문 날짜
2. **개인 경험**: 주문한 메뉴(필수), 동행인
3. **평가**: 한줄평, 장점, 단점, 추가 팁
4. 생성 버튼 클릭 → 1500~2000자 리뷰 자동 생성
5. 리뷰 복사 또는 수정 요청

### Vercel 배포 환경

웹 브라우저를 통해 바로 접근 가능합니다:

1. 배포된 URL로 접속
2. 위와 동일한 방법으로 사용
3. 모든 기능이 서버리스 환경에서 실행됨

## 🏗️ 기술 스택

### Frontend

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript** (Strict 모드)
- **Tailwind CSS 4**

### Backend/API

- **Claude AI**
  - Sonnet 4.5: 스타일 분석
  - Haiku 3.0: 리뷰 생성 및 수정
- **검색 API** (병렬 실행)
  - **Kakao 로컬 검색**: 한국 로컬 비즈니스 정보 (전화번호, 주소, 카테고리)
  - **Tavily**: 블로그 리뷰 및 일반 가게 정보
- **Axios + Cheerio**: RSS 크롤링

### 데이터베이스 & 데이터 저장

- **Supabase** (PostgreSQL): 사용자 데이터, 스타일 프로필, 리뷰 저장
- **NextAuth.js**: 인증 관리

### 배포 & 호스팅

- **Vercel**: 서버리스 배포 플랫폼
- **Edge Functions**: API 라우트 최적화

### 아키텍처

- **FSD (Feature-Sliced Design)**: 계층형 구조
- **함수형 프로그래밍**: 순수 함수 중심
- **타입 안전성**: Strict TypeScript + 런타임 검증

## 🔧 주요 명령어 (로컬 개발)

```bash
# 개발 서버 실행 (디버그 모드)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint
```

## ⚠️ 제한 사항

- 네이버 블로그 RSS 전용 (다른 플랫폼 미지원)
- 비공개 블로그 크롤링 불가
- API 호출 실패 시 재시도 없음
- 검색 결과가 없는 경우 일반적인 리뷰로 생성

---

## TODO

2026-01-15 기준으로 피드백 받은 사항들을 정리합니다!

1. 관리자 페이지 에서 작성하는 공지사항 CRUD - 🟡 Medium
2. 리뷰 수정시 원본 리뷰와 수정 리뷰와 함께 비교할 수 있도록 반영 - 🔴 HIGH
3. 리뷰 작성시 사용자가 가장 처음에 적은 초안 (draft)과 생성한 리뷰 서로 비교할 수 있도록 반영 - 🔴 HIGH

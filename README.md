# 블로그 톤 기반 리뷰 자동 생성 도구

내 블로그 문체를 학습해 **1500자 이상**의 리뷰를 자동으로 만들어주는 로컬 전용 Next.js 앱입니다.  
맛집 전용 리뷰로 작업하고있어요. 🤭

## ✨ 주요 기능

- 📝 네이버 블로그 RSS 분석으로 나만의 문체 학습
- 🔍 **Tavily 검색으로 실제 가게 정보 자동 수집**
- 🤖 Claude AI로 내 말투를 흉내낸 1500~2000자 리뷰 생성
- 🎨 생성된 리뷰 실시간 수정 및 복사
- 💾 모든 데이터 로컬 저장 (프라이버시 보장)

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
```

**API 키 발급**:
- **Anthropic** (Claude AI): https://console.anthropic.com/
  - 용도: 스타일 분석 + 리뷰 생성
- **Tavily** (검색): https://tavily.com/
  - 용도: 가게 정보 자동 검색
  - 무료: 월 1,000회

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 📖 사용 방법

### 1단계: 스타일 분석 (`/analyze`)
1. 네이버 블로그 RSS URL 입력 (예: `https://rss.blog.naver.com/YOUR_BLOG.xml`)
2. 분석할 최근 글 개수 선택 (권장: 10~20개)
3. 크롤링 및 분석 완료 대기
4. 생성된 스타일 프로필 확인

### 2단계: 리뷰 생성 (`/generate`)
1. **기본 정보**: 가게명, 위치, 방문 날짜
2. **개인 경험**: 주문한 메뉴(필수), 동행인
3. **평가**: 한줄평, 장점, 단점, 추가 팁
4. 생성 버튼 클릭 → 1500~2000자 리뷰 자동 생성
5. 리뷰 복사 또는 수정 요청

## 🏗️ 기술 스택

### Frontend
- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript** (Strict 모드)
- **Tailwind CSS 4**

### Backend/API
- **Claude AI**
  - Sonnet 4.5: 스타일 분석
  - Haiku 3.0: 리뷰 생성 및 수정
- **Tavily API**: 실시간 가게 정보 검색
- **Axios + Cheerio**: RSS 크롤링

### 아키텍처
- **FSD (Feature-Sliced Design)**: 계층형 구조
- **함수형 프로그래밍**: 순수 함수 중심
- **타입 안전성**: Strict TypeScript + 런타임 검증

## 📁 프로젝트 구조

```
blog-template/
├── app/                    # Next.js App Router 페이지 및 API
│   ├── analyze/           # 스타일 분석 페이지
│   ├── generate/          # 리뷰 생성 페이지
│   └── api/               # API 라우트
├── src/
│   ├── entities/          # 도메인 엔티티 (types)
│   ├── features/          # 기능 모듈 (analyze, review, rss-crawler)
│   ├── shared/            # 공유 유틸리티
│   └── widgets/           # 복합 UI 컴포넌트
├── prompts/               # Claude API 프롬프트 템플릿
├── data/                  # 런타임 데이터 (생성됨, git ignore)
│   ├── rss-content/       # 크롤링된 블로그 글
│   ├── styles/            # 스타일 프로필
│   └── reviews/           # 생성된 리뷰
└── docs/                  # 개발 문서
```

## 🔧 주요 명령어

```bash
# 개발 서버 실행
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

## 💰 비용

**API 사용료** (종량제):
- **Claude Sonnet 4.5**: $3/MTok (입력), $15/MTok (출력)
  - 스타일 분석 1회: 약 $0.05~0.10
- **Claude Haiku 3.0**: $0.25/MTok (입력), $1.25/MTok (출력)
  - 리뷰 생성 1회: 약 $0.01~0.02
- **Tavily**: 무료 1,000회/월, 이후 $0.001/검색

**예상 비용**: 월 10~20개 리뷰 생성 시 약 $1~2

## 📚 추가 문서

- [개발 가이드](docs/development-guide.md) - 코드 컨벤션, 패턴, 폴더 구조
- [아키텍처 상세](docs/architecture.md) - FSD 구조, 데이터 플로우
- [PRD](docs/prd.md) - 제품 요구사항 문서
- [UI 디자인 스펙](docs/UI-Design-Spec.md) - 디자인 가이드

## ⚠️ 제한 사항

- 네이버 블로그 RSS 전용 (다른 플랫폼 미지원)
- 비공개 블로그 크롤링 불가
- API 호출 실패 시 재시도 없음
- 검색 결과가 없는 경우 일반적인 리뷰로 생성

## 📄 라이선스

MIT License

---
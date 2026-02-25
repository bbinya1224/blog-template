# Changelog

All notable changes to this project will be documented in this file.


<!-- CHANGELOG:AUTO:START -->
## [2026.02.25] - refactor: 리뷰 보관함 Compact List + Timeline + 삭제 기능

### ✨ New Features
- 비로그인으로 진입시 로그인 CTA 추가 및 뒤로가기 에러 개선
- 스타일 분석 카드 타이핑 애니메이션 + 코드 품질 개선 (#40)
- Chat UI v2 리디자인 및 코드 품질 개선
- 스마트 후속 질문 기능 추가
- 뇌과학 기반 감각별 질문 리디자인
- widgets 레이어 추가 (app-shell, sidebar)
- 채팅 API 클라이언트, 카테고리 설정, Mock 데이터 추가
- 채팅 UI 컴포넌트 구현 (Claude Desktop 스타일)
- add chat API routes
- add constants and utilities
- add domain-specific hooks
- add message processor hook
- add core chat hooks
- add conversation types and Jotai atoms
- add chat-message entity types

### 🐛 Bug Fixes
- 코드 리뷰 피드백 반영 — smart-followup 버그 수정
- PR 피드백 반영 - className 중복 공백, 타입 안전성, 접근성 개선
- 사이드바 UX 개선 - 아이콘 위치 고정 및 접힌 상태 클릭 지원
- ESLint 수정, Tailwind canonical 클래스 변환, 주석 정리
- 3차 코드리뷰 피드백 반영
- 보안 이슈 수정 - 인증 이메일 사용 및 에러 메시지 마스킹
- 2차 코드리뷰 피드백 반영
- 코드리뷰 피드백 반영

### ♻️ Refactoring
- 리뷰 보관함 Compact List + Timeline + 삭제 기능
- chat-review 관심사 분리 — sidebar FSD 위반 해소 (#39)
- tRPC 제거 + 공유 HTTP 클라이언트 도입 (#38)
- Jotai → Zustand 상태 관리 마이그레이션 (#36)
- 코드 품질 개선 및 미사용 코드 정리 (#35)
- 온보딩 단계 제거 및 채팅 UX 개선
- useIsDesktop 훅 및 OrotiLogo 공유 컴포넌트 추출

### ⚡ Performance
- Anthropic prompt caching 적용

### 📝 Documentation
- PROJECT_OVERVIEW => Zustand 추가

### 🔧 Chores
- Prettier + Tailwind CSS 자동 정렬/정리 설정

### 📦 Other Changes
- 보안부분수정
- modify: 사용하지않는 함수들, 스토리북 등 정리 (#37)
- Modify/sse chat ux implement (#34)
- modify: 코드리뷰 반영
- modify: 스타일 수정
- modify: 코드리뷰반영
- modify:  채팅컨테이너, 메세지 컴포넌트 스타일 작업
- modify: 일부 UI 스타일 수정
- modify: 오롯이 리브랜딩

<!-- CHANGELOG:AUTO:END -->

## [2026.01.14] - Kakao Local API Migration

### 🚀 Highlights
- **카카오 로컬 API로 전환**
- **향상된 무료 할당량**: 일 25,000건 → 월 300,000건

### ✨ New Features
- **Kakao Local Search API**: 키워드 기반 장소 검색 통합
  - 무료 할당량: 월 300,000건
  - 카카오맵 URL 제공
  - 좌표 정보 (경도/위도)

### 🔄 Migration
- **통합 검색 유지**: 카카오 + Tavily 병렬 검색으로 성능 유지

### 📦 Files Changed
- **New**: `src/shared/lib/kakao-local.ts` (카카오 로컬 API 클라이언트)
- **Modified**: 
  - `src/shared/lib/search.ts`
  - `src/features/review/lib/review-generator.ts`
  - `src/shared/api/claude-client.ts`
  - `src/shared/config/env.ts`

---

## [2025.12.13] - UI/UX Overhaul & Ghostwriter Mode

### 🚀 Highlights
- **리뷰 생성 마법사 (Review Wizard)**: 3단계 대화형 인터페이스로 전면 개편
- **고스트라이터 (Ghostwriter)**: 초안 확장 모드 추가
- **리뷰 아카이브**: 생성된 리뷰 관리 및 AI 수정 기능

### ✨ New Features
- **Review Wizard**: Context -> Experience -> Refinement 3단계 플로우 도입
- **Draft Expansion**: 사용자 초안을 바탕으로 2,000자 리뷰 생성
- **Review Archive**: `/reviews` 페이지에서 리뷰 목록 및 상세 조회
- **AI Edit**: 생성된 리뷰에 대한 수정 요청 기능

### 🛠️ Improvements
- **Style Profile**: 구조(Structure) 정보 표시 버그 수정
- **Analyze Flow**: 기존 프로필 존재 시 분석 건너뛰기

### 🔒 Security
- **Dependencies**: Next.js, React 등 주요 패키지 최신 버전 업데이트

# Changelog

All notable changes to this project will be documented in this file.

## [2026.01.13] - Naver Search API Integration & Debug Mode

### 🚀 Highlights
- **네이버 지역 검색 API 통합**: 한국 로컬 비즈니스 정보 자동 수집
- **개발 환경 디버그 모드**: 검색 결과를 브라우저 콘솔에서 실시간 확인

### ✨ New Features
- **Naver Local Search API**: 전화번호, 주소, 카테고리 등 구조화된 정보 자동 수집
  - 무료 할당량: 일 25,000건
  - 네이버 + Tavily 병렬 검색으로 빠른 응답 시간

### 🛠️ Improvements
- **Prompt Engineering**: 스타일 프로필에 따라 정보 표시 방식 자동 조정
  - 구조화된 정보 블록 스타일 (예: 📍 위치, 📞 전화)
  - 서사적 흐름 스타일 (자연스러운 문단)
- **Type Safety**: `ReviewGenerationResult` 타입 추가로 타입 안전성 강화
- **Error Handling**: 검색 API 실패 시에도 리뷰 생성 계속 진행

### 📦 New Files
- `src/shared/lib/naver-search.ts`: 네이버 지역 검색 API 클라이언트

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

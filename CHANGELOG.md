# Changelog

All notable changes to this project will be documented in this file.

## [v1.0.1] - 2026.01.30

### 📝 변경사항

---

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

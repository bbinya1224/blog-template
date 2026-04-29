# 오롯이 (Oroti) 프로젝트 리포트

> 2026-04-25 기준 · graphify 603 nodes / 507 edges 분석 기반

---

## 1. 프로젝트 개요

**오롯이**는 사용자의 글쓰기 스타일을 학습하여, 대화형 인터페이스로 맛집 리뷰를 자동 생성하는 AI 웹 서비스다.

### 핵심 가치

- 사용자의 **고유한 문체**로 리뷰를 생성 (블로그 글 분석 → 스타일 프로필)
- ChatGPT처럼 **대화하듯** 리뷰 정보를 수집 (자연어 대화 파싱)
- 생성된 리뷰를 **실시간 스트리밍**으로 보여주고, 수정/저장까지 원스톱

### 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 언어 | TypeScript (strict) |
| UI | React 19 + Tailwind CSS v4 |
| 상태관리 | Zustand |
| AI | Claude Sonnet 4.5 (생성), Claude Haiku 4.5 (파싱/수정) |
| DB | Supabase (PostgreSQL) |
| 인증 | NextAuth (Google OAuth) |
| 검색 | 카카오 로컬 API + Tavily |
| 크롤링 | cheerio + axios (네이버 블로그 RSS) |

---

## 2. 아키텍처

### FSD (Feature-Sliced Design)

```text
src/
├── shared/          순수 유틸, API 클라이언트, 공통 UI 원자
├── entities/        도메인 모델 (ChatMessage, Review, StyleProfile)
├── features/        비즈니스 기능 단위
│   ├── chat-review/     핵심 — 채팅 리뷰 생성 (가장 큰 feature)
│   ├── analyze-style/   블로그 스타일 분석
│   ├── review-edit/     리뷰 diff/편집
│   ├── review/          리뷰 복사/삭제
│   ├── rss-crawler/     RSS 크롤링
│   └── admin/           관리자 프롬프트 CRUD
├── widgets/         조합된 독립 블록 (ChatContainer, Sidebar, ReviewDetail)
└── views/           페이지 수준 컴포넌트
```

### 상태 머신: FLOW_GRAPH

채팅 흐름은 `FLOW_GRAPH`라는 상태 머신 테이블로 관리된다. 각 노드는 순수 핸들러(`onInput`)로 메시지/액션/부수효과를 분리 반환한다.

```text
style-check → style-setup → topic-select → conversation → generating → review-edit → complete
```

```text
[Client] useChatHandlers.handleSendMessage()
    │
    ├── FLOW_GRAPH[step].onInput()     ← 순수 핸들러 (테스트 가능)
    │     └── { messages, actions, sideEffect }
    │
    ├── executeSideEffect()            ← 비동기 API 호출 분리
    │
    └── dispatchActions()              ← Zustand store 상태 전이
```

---

## 3. 핵심 로직 상세

### 3-1. 스타일 분석 플로우

```text
네이버 블로그 URL 입력
  → convertBlogUrlToRss()
  → POST /api/fetch-rss
      RSS XML → cheerio로 포스트 링크 추출
      → 각 포스트 HTML 크롤링 (HTTPS → HTTP fallback)
      → extractArticleText() — 가장 긴 본문 추출
      → cleanSinglePost() — 전처리
      → rss_contents 테이블 저장
  → POST /api/analyze-style
      → Claude Sonnet에 블로그 글 전달
      → StyleProfile JSON 반환
      → user_styles 테이블 저장
```

**StyleProfile 구조**: `writing_style`(문체/톤/감정/이모지 등) + `visual_structure`(줄바꿈/단락) + `structure_pattern`(글 구조/도입부) + `keyword_profile`(빈도어/주제 편향)

### 3-2. 리뷰 생성 플로우

```text
[conversation 단계]
  사용자 자유 대화
    → POST /api/chat/parse-conversation (Claude Haiku)
        대화에서 정보 추출: name, location, date, menu, companion, pros, cons, extra
    → 장소명 감지 시: 카카오 + Tavily 병렬 검색
    → isReady 판단: reviewPayloadSchema 전체 통과 또는 (생성 의도 + name 있음)

[generating 단계]
  → POST /api/chat/generate-review (SSE 스트리밍, Claude Sonnet)
      프롬프트에 주입:
      ├── StyleProfile JSON (사용자 문체)
      ├── 카카오 장소 정보 (주소/카테고리/전화번호)
      ├── Tavily 검색 컨텍스트 (블로그 리뷰 참고)
      ├── writing_samples (사용자 과거 글 few-shot)
      └── ReviewPayload 전체 (수집된 리뷰 정보, XML 태그로 sanitize)
  → 실시간 토큰 스트리밍으로 텍스트 표시
  → 완료 시 인라인 액션 버튼 fade-in (복사/완벽해요/수정)

[review-edit 단계]
  "수정할래요" → POST /api/chat/edit-review (SSE, Claude Haiku)
  "완벽해요"   → 리뷰 확정 + 대화 이력 DB 저장
```

### 3-3. 검색 로직

```text
searchStoreInfo(query)
  ├── searchKakaoPlace() — 카카오 로컬 키워드 검색 (size=1, 10s timeout)
  └── searchTavilyContext() — Tavily 웹 검색 (5건, 30s timeout)
  → Promise.all 병렬 실행
  → 한쪽 실패해도 다른 쪽 계속 (Fail-safe)
```

**한계**: 카카오 로컬 API는 **국내 장소 전용**. 해외 맛집은 카카오 결과 없이 Tavily + 사용자 입력만으로 생성.

### 3-4. 프롬프트 관리

프롬프트는 코드에 하드코딩되지 않고 **Supabase `prompts` 테이블**에서 동적 조회. 5분 TTL 인메모리 캐시. 관리자 페이지에서 실시간 수정 가능.

| 프롬프트 키 | 용도 | 모델 |
|---|---|---|
| `review_generation_system/user` | 리뷰 생성 | Sonnet (4096 tokens) |
| `review_edit_system/user` | 리뷰 수정 | Haiku (4096 tokens) |
| `parse_conversation_system/user` | 대화 파싱 | Haiku (512 tokens) |
| `smart_followup_system/user` | 후속 질문 | Haiku |
| `style_analysis_system/user` | 스타일 분석 | Sonnet (8192 tokens) |

---

## 4. API 라우트 전체 목록

| 라우트 | 메서드 | 역할 | 보호 |
|---|---|---|---|
| `/api/chat/generate-review` | POST | 리뷰 SSE 스트리밍 생성 | Auth + Quota |
| `/api/chat/edit-review` | POST | 리뷰 수정 SSE 스트리밍 | Auth + Quota |
| `/api/chat/parse-conversation` | POST | 대화 파싱 (정보 추출) | Auth + Quota |
| `/api/chat/smart-followup` | POST | 후속 질문 생성 | Auth |
| `/api/place/search` | POST | 카카오+Tavily 장소 검색 | Auth |
| `/api/fetch-rss` | POST | RSS 크롤링 → DB 저장 | Auth |
| `/api/analyze-style` | POST | 블로그 글 → 스타일 분석 | Auth |
| `/api/style-profile` | GET | 스타일 프로필 조회 | Auth |
| `/api/reviews` | GET | 리뷰 목록 조회 | Auth |
| `/api/reviews/[id]` | PUT/DELETE | 리뷰 수정/삭제 | Auth + Quota |
| `/api/admin/*` | CRUD | 프롬프트/화이트리스트 관리 | Admin (bcrypt) |

---

## 5. DB 테이블 구조

| 테이블 | 주요 컬럼 | 용도 |
|---|---|---|
| `approved_users` | email, is_preview, usage_count | 사용자 인가/쿼터 |
| `user_reviews` | user_email, restaurant_name, review_content, metadata, conversation | 생성된 리뷰 저장 |
| `user_styles` | user_email, blog_name, style_data (jsonb) | 스타일 프로필 |
| `rss_contents` | user_email, content, title | 크롤링된 블로그 글 |
| `prompts` | prompt_key, role, content, version, is_active | AI 프롬프트 |
| `prompt_categories` | slug, display_name | 프롬프트 카테고리 |

---

## 6. 잘된 점

### 아키텍처

- **FSD 구조의 일관된 적용** — entities/features/widgets/views 경계가 명확하고, barrel export로 모듈 캡슐화가 잘 되어 있음
- **순수 핸들러 + 부수효과 분리** — `FLOW_GRAPH`의 `onInput`은 순수 함수로, 테스트 가능한 핵심 로직과 API 호출이 완전히 분리됨
- **상태 머신 기반 플로우 제어** — step 전이가 명시적이고, `stepTransitions`로 허용된 전이만 가능
- **단일 Zustand store + dispatchActions** — 상태 변경이 `ConversationAction` 타입으로 추적 가능

### 에러 처리

- **계층적 에러 클래스** — `AppError` 기반으로 `RateLimitError`, `TimeoutError`, `RetryExhaustedError` 등 의미 있는 분류
- **Result 패턴** — `Ok/Err`로 함수형 에러 처리 기반 마련
- **ApiResponse 빌더** — 일관된 API 응답 형식
- **Fail-safe 검색** — 카카오/Tavily 중 하나 실패해도 리뷰 생성 계속

### 보안

- **프롬프트 인젝션 방어** — `sanitizeUserInput` + `wrapInXmlTag` + `withPromptDefense` 3중 방어
- **Admin bcrypt 인증** — timing attack 방지 (dummy compare), IP 기반 실패 카운팅
- **원자적 쿼터 관리** — `try_reserve_usage` RPC로 TOCTOU 레이스 컨디션 방지
- **도메인 화이트리스트** — RSS 크롤링 대상 제한

### UX

- **SSE 실시간 스트리밍** — 토큰 단위로 텍스트가 타이핑되듯 표시
- **인라인 리뷰 액션** — DOM 교체 없이 같은 버블에서 액션 fade-in
- **대화형 정보 수집** — 자연어로 리뷰 정보를 수집, 장소 자동 검색
- **리뷰 상세 AI 편집** — BottomSheet에서 수정 요청 → diff 하이라이트 표시

---

## 7. 개선이 필요한 점

### 7-1. 타입 안전성

| 문제 | 위치 | 설명 |
|---|---|---|
| Zod 스키마 ↔ 타입 이원화 | `styleProfile.ts` | 스키마는 optional, 타입은 required. `z.infer`로 통일 필요 (현재 PR에서 진행 중) |
| `metadata: Record<string, unknown>` | `ChatMessage` | 타입 가드 없이 `message.metadata?.streaming` 등 접근. 메시지 타입별 metadata 타입을 discriminated union으로 |
| pre-existing TS 에러 | 테스트 파일 다수 | `TS18048`, `TS2339` 등 미해결 |

### 7-2. 테스트 커버리지

| 부족한 영역 | 설명 |
|---|---|
| `reviewReadiness.ts` | 핵심 판단 로직이지만 테스트 없음 |
| `ReviewActions.tsx` | 신규 컴포넌트, 테스트 없음 |
| `toISODate` / `toLocalISODate` | 날짜 파싱 엣지케이스 커버 필요 |
| SSE 스트리밍 | 스트리밍 중단/재연결 시나리오 미테스트 |
| step-handlers 통합 | 개별 핸들러는 있으나 전체 플로우 통합 테스트 없음 |

### 7-3. 검색 기능 한계

- **카카오 API 국내 전용** — 해외 맛집 검색 불가. Google Places API 등 글로벌 소스 고려 필요
- **Tavily 검색 품질 불확실** — 기본(basic) 검색으로 5건만 가져옴. 맛집 특화 검색이 아님
- **장소 확인 UX** — 카카오 결과가 없을 때 사용자에게 직접 정보 입력을 유도하는 흐름이 약함

### 7-4. 대화 파싱 정확도

- **`isGenerateIntent` 패턴이 협소** — "써줘", "만들어" 정도만 매칭. "리뷰 부탁", "완성해줘", "써 줘"(띄어쓰기) 등 미매칭
- **자연어 날짜 파싱** — "지난주 금요일", "3일 전" 등 복잡한 표현 미지원. `toISODate` fallback 시 오늘 날짜로 무음 대체
- **`reviewMinimumSchema`가 name 하나** — name만 있으면 생성 가능하여 정보가 부족한 리뷰가 나올 수 있음

### 7-5. 에러/복구 UX

- **DB 저장 실패 시 사용자 무피드백** — `console.warn`만 남기고 UI에 표시 없음. 리뷰를 생성했지만 저장이 안 된 상태를 사용자가 모름
- **스트리밍 중단 시 복구** — SSE 연결이 끊겼을 때 retry 로직 없음
- **쿼터 초과 메시지** — 403 에러 시 "다음에 다시" 정도만 표시. 업그레이드 안내나 남은 횟수 표시 없음

### 7-6. 구조적 개선점

- **God Node: `POST()` 24 edges** — `generate-review/route.ts`에 검색, 프롬프트 조립, 스트리밍, DB 저장이 전부 들어있음. 서비스 레이어 분리 필요
- **프롬프트 관리 → code 분리** — 현재 DB에서 동적 로드하지만, 프롬프트 변경 이력 추적(버전관리)이 약함. version 필드가 있으나 활용 안 됨
- **`useChatStore` 단일 store 비대화** — 채팅 UI 상태, 도메인 상태, 세션 상태가 한 곳에 혼재. 관심사별 slice 분리 고려
- **리뷰 주제 확장성** — `selectedTopic`에 restaurant만 활성. book/travel 등은 coming soon으로 막혀있음. topic별 step-handler/프롬프트를 플러그인 구조로 만들면 확장 용이
- **RSS 크롤러 네이버 전용** — 티스토리, 브런치 등 다른 플랫폼 미지원

### 7-7. 보안/인프라

- **Rate Limiting 인메모리** — 서버 재시작 시 초기화. 다중 인스턴스에서 공유 불가. Redis 등 외부 저장소 고려
- **console.log 프로덕션 노출** — API 라우트에 디버그 로그가 다수. 구조화된 로거(log level) 도입 필요
- **Admin 패스워드 환경변수** — bcrypt 해시를 환경변수로 관리하지만, 관리자 계정 체계(로그인/세션)가 없음

---

## 8. graphify 커뮤니티 구조 (핵심)

| 커뮤니티 | 주요 노드 | 역할 |
|---|---|---|
| C0 | `readBlogSamples`, `buildReviewSystemPrompt`, `getPrompts` 외 25개 | **프롬프트 & 데이터 파이프라인** |
| C1 | `useChatOrchestration`, `useChatHandlers`, `ChatPageContent` 외 14개 | **채팅 UI 오케스트레이션** |
| C2 | `generateHeuristicProfile`, `detectTone`, `extractFrequentWords` 외 18개 | **스타일 분석 엔진** |
| C3 | `AppError`, `RateLimitError`, `SSEError` 외 10개 | **에러 클래스 계층** |
| C4 | `extractArticleText`, `fetchHtml`, `withProtocolFallback` 외 16개 | **RSS 크롤링 파이프라인** |
| C5 | `classifyIntent`, `handleReviewEdit`, `handleMethodSelection` 외 10개 | **대화 의도 분류 & step handler** |
| C6 | `callClaude`, `getAnthropicClient`, `editReviewWithClaude` 외 12개 | **Claude API 통합 레이어** |
| C9 | `searchKakaoPlace`, `searchStoreInfo`, `searchTavilyContext` 외 10개 | **검색 엔진 (카카오 + Tavily)** |
| C10 | `createPromptPostHandler`, `createWhitelistGetHandler` 외 11개 | **Admin CRUD 핸들러** |
| C12 | `apiGet`, `apiPost`, `apiDelete`, `parseResponse` 외 7개 | **HTTP 클라이언트** |
| C18 | `validateEditedReview`, `extractProtectedFacts` 외 5개 | **리뷰 수정 검증** |

**God Nodes** (가장 연결이 많은 노드):
1. `POST()` — 24 edges (다수 API 라우트의 진입점)
2. `GET()` — 12 edges
3. `withAdmin()` — 11 edges
4. `getPrompts()` — 9 edges
5. `useChatOrchestration()` — 6 edges

---

## 9. 페이지 구조

| 경로 | 역할 | 인증 |
|---|---|---|
| `/` | 메인 채팅 UI (미인증: 프리뷰, 인증: 실제 채팅) | 선택 |
| `/analyze-style` | 스타일 분석 (블로그 URL/텍스트/설문) | 필수 |
| `/reviews` | 리뷰 보관함 (월별 그룹 목록) | 필수 |
| `/reviews/[id]` | 리뷰 상세 (인라인 편집, AI 수정, 대화 타임라인) | 필수 |
| `/reviews/preview` | 리뷰 미리보기 | 필수 |
| `/dashboard` | 대시보드 | 필수 |
| `/admin` | 관리자 (프롬프트/화이트리스트 CRUD) | Admin |
| `/auth/error` | 인증 에러 | 공개 |

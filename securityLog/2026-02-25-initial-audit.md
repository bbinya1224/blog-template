# 보안 점검 결과 — 2026년 2월

**점검일**: 2026-02-25
**대상**: 오롯이 (Oroti) 프로덕션 코드베이스
**방법**: 정적 코드 분석

---

## 발견된 이슈

### 1. High — SSRF (Server-Side Request Forgery)

**위치**: `/api/fetch-rss` → `createFetchRssHandler.ts` → `rssCrawler.ts` → `httpClient.ts`

**문제**:
- `rssUrl` 입력에 대해 "문자열인지"만 검사하고 **도메인 제한이 없음**
- 서버가 사용자 입력 URL을 `axios.get()`으로 직접 요청
- RSS 내부의 `<link>` 태그도 그대로 `fetchHtml()`로 재요청

**공격 시나리오**:
```
POST /api/fetch-rss
{ "rssUrl": "http://169.254.169.254/latest/meta-data/" }
```
→ Vercel/AWS 내부 메타데이터 엔드포인트에 접근하여 IAM 자격증명 탈취 가능

**수정 방안**:
- RSS URL을 네이버 블로그 도메인(`rss.blog.naver.com`)으로 제한 (이미 `isValidNaverRssUrl` 함수가 있으나 미사용)
- RSS에서 추출한 포스트 링크도 네이버 도메인(`blog.naver.com`, `m.blog.naver.com`)인지 검증
- Private IP 대역(`10.x`, `172.16-31.x`, `192.168.x`, `169.254.x`, `127.x`) 차단

---

### 2. High — 쿼터 우회 (`/api/chat/*`)

**위치**: `app/api/chat/generate-review/route.ts`, `app/api/chat/edit-review/route.ts`, `app/api/chat/smart-followup/route.ts`

**문제**:
- 구 API(`createGenerateReviewHandler.ts`)에는 `withQuota` 미들웨어가 적용되어 있음
- 채팅 플로우가 사용하는 `/api/chat/*` 3개 라우트에는 **쿼터 체크가 전혀 없음**
- 인증(`getServerSession`)만 있어서, 로그인한 preview 사용자가 무제한으로 Claude API 호출 가능

**영향**:
- `generate-review`: Claude Sonnet 호출 — 건당 비용 높음
- `edit-review`: Claude Haiku 호출
- `smart-followup`: Claude Haiku 호출

**수정 방안**:
- `/api/chat/generate-review`에 쿼터 소비 로직 추가 (가장 비용이 큰 엔드포인트)
- 쿼터 확인 → API 호출 → 성공 시 쿼터 증가 순서로 처리

---

### 3. Medium — 관리자 인증 브루트포스 방어 부재

**위치**: `src/shared/api/middleware/withAdmin.ts`

**문제**:
- `X-Admin-Password` 헤더 + bcrypt 비교만 수행
- 시도 횟수 제한, 지연, IP 차단이 없음
- Vercel 배포 환경에서 공개 인터넷으로 접근 가능

**수정 방안**:
- 실패 시 지연 응답 추가 (bcrypt 자체가 느리긴 하지만 추가 방어)
- Vercel Edge에서 rate limit 적용하거나, 인메모리 시도 카운터 추가

---

### 4. Medium — 로그에 사용자/생성 콘텐츠 노출 (PII)

**위치**: 여러 route handler의 `console.log`/`console.warn`

**문제**:
- `edit-review route.ts:45`: 수정 요청 텍스트 일부 로그
- `smart-followup route.ts:73`: AI 응답 전문 로그
- `generate-review route.ts:80,99`: 검색 쿼리, 결과 정보 로그

**참고**: `next.config.ts`의 `compiler.removeConsole`이 `console.log`를 프로덕션에서 strip하므로 대부분 제거됨. `console.error`/`console.warn`에 포함된 민감 정보만 주의.

**수정 방안**: 이번 패치에서는 보류 (프로덕션에서 자동 strip되는 `console.log` 위주)

---

### 5. Low — maxPosts 상한 부재

**위치**: `createFetchRssHandler.ts:36`

**문제**:
- `maxPosts`의 타입(number)만 검사하고 상한이 없음
- `maxPosts: 10000` 같은 값으로 과도한 크롤링 + 서버 리소스 소모 유도 가능

**수정 방안**:
- 상한값 설정 (예: 최대 50)

---

## 긍정 요소

- SQL 문자열 직접 조립 없음 — Supabase query builder 사용으로 SQLi 위험 낮음
- `.env.local`은 `.gitignore` 처리됨
- 모든 API에 `getServerSession` 인증 적용
- bcrypt로 관리자 비밀번호 해싱

---

## 이번 패치 범위

| # | 이슈 | 패치 여부 |
|---|------|-----------|
| 1 | SSRF 차단 | **패치** — 도메인 allowlist + private IP 차단 |
| 2 | 쿼터 우회 | **패치** — `/api/chat/generate-review`에 쿼터 체크 추가 |
| 3 | Admin 브루트포스 | **패치** — 실패 지연 + 인메모리 rate limit |
| 4 | 로그 PII | 보류 — removeConsole로 대부분 strip됨 |
| 5 | maxPosts 상한 | **패치** — 상한 50으로 제한 |

# 보안 패치 로그 — 2026-02-26

**브랜치**: `fix/security-ssrf-quota-admin`
**기반**: `develop`

---

## 배경

정적 코드 분석으로 5개 보안 이슈 발견. 이 중 4개를 코드 수정으로 패치하고, 추가 security-reviewer 에이전트 리뷰를 통해 2차 보완까지 완료.

---

## 패치 1: SSRF 차단 (3-layer defense)

**심각도**: HIGH → CRITICAL (DNS rebinding 포함)
**CWE**: [CWE-918](https://cwe.mitre.org/data/definitions/918.html)

### 문제

- `/api/fetch-rss`에서 사용자 입력 URL(`rssUrl`)을 서버가 직접 요청
- RSS 내부 `<link>` 태그 URL도 검증 없이 `fetchHtml()`로 재요청
- Private IP 차단이 문자열 기반이라 DNS rebinding 우회 가능

### 공격 시나리오

```
POST /api/fetch-rss
{ "rssUrl": "http://169.254.169.254/latest/meta-data/" }
→ AWS/Vercel 내부 메타데이터 엔드포인트에서 IAM 자격증명 탈취
```

### 해결

**Layer 1 — RSS URL allowlist** (`createFetchRssHandler.ts`)
```typescript
// constants.ts에서 관리 — 새 플랫폼 추가 시 여기만 수정
export const ALLOWED_RSS_HOSTS = ['rss.blog.naver.com'];

function isAllowedRssUrl(url: string): boolean {
  const { hostname, pathname } = new URL(url);
  return ALLOWED_RSS_HOSTS.includes(hostname) && pathname.endsWith('.xml');
}
```

**Layer 2 — 포스트 링크 allowlist** (`rssCrawler.ts`)
```typescript
export const ALLOWED_POST_HOSTS = ['blog.naver.com', 'm.blog.naver.com'];

// RSS에서 추출한 링크를 fetch 전에 필터링
const safeLinks = postLinks.filter(link => isAllowedPostLink(link));
```

**Layer 3 — DNS resolution 기반 Private IP 차단** (`httpClient.ts`)
```typescript
import { lookup } from 'dns/promises';
import { isIP } from 'net';

async function validateHost(url: string): Promise<void> {
  const { hostname } = new URL(url);

  // IP 리터럴이면 직접 검사
  if (isIP(hostname) && isPrivateIp(hostname)) throw ...;

  // 도메인이면 DNS 해석 후 실제 IP 검사 (DNS rebinding 방어)
  const { address } = await lookup(hostname);
  if (isPrivateIp(address)) throw ...;
}
```

차단 대상 IP 대역:
- `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- `169.254.0.0/16` (link-local), `0.0.0.0/8`
- `100.64.0.0/10` (CGN)
- IPv6: `::1`, `fc00::/7`, `fe80::/10`
- IPv6-mapped IPv4: `::ffff:127.0.0.1` 등

**추가 보완 — URL 파라미터 입력 검증** (`urlUtils.ts`)
```typescript
// blogId: 영숫자+하이픈+언더스코어만 허용
if (blogId && !/^[\w-]+$/.test(blogId)) return {};
// logNo: 숫자만 허용
if (logNo && !/^\d+$/.test(logNo)) return {};
```

**에러 메시지 일반화**
- 이전: `"차단된 호스트입니다: 127.0.0.1"` (내부 정보 노출)
- 이후: `"요청할 수 없는 주소입니다."` (일반 메시지 + 서버 로그에만 상세 기록)

### 참조
- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [CWE-918: Server-Side Request Forgery](https://cwe.mitre.org/data/definitions/918.html)

---

## 패치 2: 쿼터 우회 차단

**심각도**: HIGH
**CWE**: [CWE-367](https://cwe.mitre.org/data/definitions/367.html) (TOCTOU)

### 문제

- `/api/chat/generate-review`에 쿼터 체크가 없었음
- 로그인한 preview 사용자가 Claude Sonnet API를 무제한 호출 가능
- 쿼터 확인과 증가 사이에 긴 시간 간격 (스트리밍 수십 초) → TOCTOU 레이스 컨디션

### 해결

```typescript
// 1. 쿼터 확인
const userStatus = await getUserStatus(authenticatedEmail);
if (userStatus?.is_preview && (userStatus.usage_count || 0) >= 2) {
  return ApiResponse.quotaExceeded();
}

// 2. 낙관적 쿼터 증가 — API 호출 전에 먼저 차감하여 TOCTOU 방지
if (userStatus?.is_preview) {
  await incrementUsageCount(authenticatedEmail);
}

// 3. Claude API 스트리밍 시작...
```

### Supabase RPC로 원자적 처리 (적용 완료)

`try_reserve_usage` RPC 함수로 DB 레벨에서 원자적 check-and-increment 구현:

```sql
CREATE OR REPLACE FUNCTION try_reserve_usage(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_is_preview BOOLEAN;
BEGIN
  SELECT is_preview INTO v_is_preview
  FROM approved_users WHERE email = p_email;

  -- 비 preview 사용자는 항상 허용
  IF v_is_preview IS NULL OR v_is_preview = false THEN
    RETURN true;
  END IF;

  -- Preview 사용자: 원자적 쿼터 확인 + 증가
  UPDATE approved_users
  SET usage_count = usage_count + 1
  WHERE email = p_email AND is_preview = true AND usage_count < 2;

  RETURN FOUND;
END;
$$;
```

코드에서의 사용:
```typescript
const { data: reserved } = await supabaseAdmin.rpc('try_reserve_usage', {
  p_email: authenticatedEmail,
});
if (reserved === false) return ApiResponse.quotaExceeded();
```

### 참조
- [CWE-367: TOCTOU Race Condition](https://cwe.mitre.org/data/definitions/367.html)

---

## 패치 3: Admin 브루트포스 방어

**심각도**: MEDIUM
**CWE**: [CWE-799](https://cwe.mitre.org/data/definitions/799.html), [CWE-348](https://cwe.mitre.org/data/definitions/348.html)

### 문제

- `X-Admin-Password` 헤더 + bcrypt 비교만 수행
- 시도 횟수 제한, 지연, IP 차단 없음
- 공개 인터넷에서 무제한 브루트포스 가능

### 해결

```
withAdmin.ts 변경사항:
├── IP 기반 인메모리 rate limit (5회/15분)
├── Vercel 신뢰 헤더 우선 사용 (x-vercel-forwarded-for)
├── 실패 시 1초 지연 응답
├── 비밀번호 미제공 시 dummy bcrypt → 일정한 응답 시간 (타이밍 공격 방어)
└── Map 크기 제한 10,000 (메모리 누수 방지)
```

### 미해결 (인프라 의존)

**서버리스 환경에서 인메모리 Map 무효화**: Vercel Lambda 인스턴스 간에 Map이 공유되지 않음. 프로덕션에서는 Upstash Redis 기반 rate limit으로 전환 필요.

```typescript
// 향후 구현 예정
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
});
```

### 참조
- [CWE-799: Improper Control of Interaction Frequency](https://cwe.mitre.org/data/definitions/799.html)
- [Upstash Rate Limit](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)

---

## 패치 4: maxPosts 상한 제한

**심각도**: LOW

### 문제

`maxPosts` 파라미터에 상한이 없어 `maxPosts: 10000`으로 과도한 크롤링 유도 가능.

### 해결

```typescript
const MAX_POSTS_LIMIT = 50;
const cappedMaxPosts = Math.min(Math.max(maxPosts, 1), MAX_POSTS_LIMIT);
```

---

## 패치 5: /api/chat/* 전체 쿼터 체크 + 민감 로그 제거

**심각도**: HIGH (쿼터), MEDIUM (로그)

### 문제

- `edit-review`, `smart-followup` 라우트에 쿼터 체크가 없어 preview 사용자가 무제한 Haiku API 호출 가능
- `edit-review:45` — 유저 수정 요청 텍스트 일부를 로그에 포함
- `smart-followup:73` — AI 응답 전문을 로그에 포함

### 해결

```typescript
// edit-review, smart-followup 모두 동일 패턴 적용
const userStatus = await getUserStatus(session.user.email);
if (userStatus?.is_preview && (userStatus.usage_count || 0) >= 2) {
  return ApiResponse.quotaExceeded();
}
```

- 쿼터 읽기 전용 — Haiku 호출은 카운트 증가 안 함 (generate-review만 증가)
- 민감 로그: 유저 입력/AI 출력 내용 제거, 길이 정보만 남김

---

## 변경 파일 요약

| 파일 | 변경 내용 |
|------|-----------|
| `src/features/rss-crawler/lib/constants.ts` | `ALLOWED_RSS_HOSTS`, `ALLOWED_POST_HOSTS` 추가 |
| `src/features/rss-crawler/api/createFetchRssHandler.ts` | RSS URL allowlist 검증 + maxPosts 상한 |
| `src/features/rss-crawler/lib/httpClient.ts` | DNS resolution 기반 private IP 차단 |
| `src/features/rss-crawler/lib/rssCrawler.ts` | 포스트 링크 도메인 필터링 |
| `src/features/rss-crawler/lib/urlUtils.ts` | blogId/logNo 입력 검증 |
| `app/api/chat/generate-review/route.ts` | Supabase RPC 원자적 쿼터 체크 |
| `app/api/chat/edit-review/route.ts` | 쿼터 체크 + 민감 로그 제거 |
| `app/api/chat/smart-followup/route.ts` | 쿼터 체크 + 민감 로그 제거 |
| `src/shared/api/middleware/withAdmin.ts` | Rate limit + 타이밍 방어 + Map 제한 |

---

## 미해결 과제 (인프라 의존)

| 이슈 | 필요 인프라 | 우선순위 |
|------|-------------|----------|
| ~~원자적 쿼터 체크~~ | ~~Supabase RPC 함수~~ | ~~HIGH~~ **해결** |
| 서버리스 rate limit | Upstash Redis | MEDIUM |
| 전역 Admin 시도 카운터 | Upstash Redis | LOW |

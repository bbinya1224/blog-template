# 보안 체크리스트 — 오롯이 (Oroti)

코드 변경 시 아래 항목을 점검합니다. 새로운 이슈 발견 시 `securityLog/` 에 패치 로그를 추가합니다.

---

## 1. 인증 & 인가

- [ ] 모든 API 라우트에 `getServerSession` 또는 `withAuth` 적용
- [ ] preview 사용자 쿼터 체크 (`withQuota` 또는 인라인 검증)
- [ ] 관리자 엔드포인트에 `withAdmin` + rate limit 적용
- [ ] 민감 작업(삭제, 수정)에 소유권 검증 (`user_email` 일치 확인)

## 2. 입력 검증

- [ ] 사용자 입력 URL에 도메인 allowlist 적용 (SSRF 방지)
- [ ] Private IP / 내부 네트워크 주소 차단 (DNS resolution 포함)
- [ ] 숫자 입력에 상한/하한 제한 (`maxPosts` 등)
- [ ] Zod 스키마 또는 타입 가드로 모든 API input 검증
- [ ] URL에서 추출한 파라미터 (blogId, logNo 등) 형식 검증

## 3. SSRF 방어 (다층)

- [ ] Layer 1: RSS URL 도메인 allowlist (`ALLOWED_RSS_HOSTS`)
- [ ] Layer 2: 포스트 링크 도메인 allowlist (`ALLOWED_POST_HOSTS`)
- [ ] Layer 3: Private IP 차단 + DNS resolution 검증 (`validateHost`)
- [ ] 에러 메시지에 내부 호스트/IP 정보 미노출

## 4. Rate Limiting

- [ ] Admin 엔드포인트에 IP 기반 rate limit
- [ ] Vercel 신뢰 헤더 사용 (`x-vercel-forwarded-for`)
- [ ] 인메모리 Map 크기 제한 (메모리 누수 방지)
- [ ] **[TODO]** 서버리스 환경 대응 — Upstash Redis 기반 rate limit 전환

## 5. 쿼터 관리

- [ ] Claude API 호출 전 쿼터 확인
- [x] `generate-review`: Supabase RPC (`try_reserve_usage`)로 원자적 check-and-increment 구현
- [x] `edit-review` / `smart-followup`: `getUserStatus` 읽기 전용 체크 (Haiku 호출, 쿼터 미소비)
- [ ] `getUserStatus` null 반환 시 fail-closed 처리

## 6. 데이터 보호

- [ ] 환경변수/API 키 코드에 미포함
- [ ] `.env` 파일 `.gitignore` 처리
- [ ] Supabase는 `supabaseAdmin` (service key)으로 서버사이드에서만 접근
- [ ] 보안 관련 에러는 서버 로그에만 상세 기록, 클라이언트엔 일반 메시지

## 7. 의존성 & 인프라

- [ ] `npm audit` 정기 실행
- [ ] 프로덕션에서 `console.log` 자동 strip (`compiler.removeConsole`)
- [ ] HTTPS 강제 (`enforceHttps`)

---

## 점검 주기

| 시점 | 수행 항목 |
|------|-----------|
| PR 머지 전 | 변경된 API 라우트에 해당하는 체크리스트 항목 확인 |
| 월 1회 | 전체 체크리스트 점검 + `npm audit` |
| 새 외부 API 연동 시 | SSRF, 입력 검증, 타임아웃 항목 집중 점검 |

---

## 참조

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [CWE-918: Server-Side Request Forgery](https://cwe.mitre.org/data/definitions/918.html)
- [CWE-367: TOCTOU Race Condition](https://cwe.mitre.org/data/definitions/367.html)
- [CWE-799: Improper Control of Interaction Frequency](https://cwe.mitre.org/data/definitions/799.html)

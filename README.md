# 블로그 톤 기반 리뷰 자동 생성 도구

내 블로그 문체를 학습해 1500자 이상의 리뷰를 자동으로 만들어주는 로컬 전용 Next.js 앱입니다. `/docs` 폴더의 PRD·UI 명세와 `/prompts` 폴더의 프롬프트를 토대로 초기 셋업을 구성했습니다.

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 열어 스타일 분석 → 리뷰 생성 플로우를 바로 확인할 수 있습니다.

## 폴더 개요

| 경로 | 설명 |
| --- | --- |
| `src/app` | App Router 기반 페이지(`/`, `/analyze`, `/generate`)와 API Routes |
| `src/components` | Step Indicator, Section Card 등 공통 UI |
| `src/lib` | RSS 크롤러, 스타일 분석 휴리스틱, 리뷰 생성기, 파일 저장 유틸 |
| `data/rss-content` | RSS에서 정제한 블로그 본문(`blog-posts.txt`) |
| `data/styles` | 스타일 프로필 JSON (`my-style.json`) |
| `data/reviews` | 생성된 리뷰를 `{가게명}_{날짜}.md`로 저장 |
| `prompts/prompts.ts` | 스타일 분석/리뷰 생성/수정 프롬프트 원본 (앱에서는 `src/lib/prompts.ts`를 통해 재사용) |

## 구현된 흐름

1. **스타일 분석 페이지 (`/analyze`)**
   - RSS URL + 최근 글 개수를 입력하면 `/api/fetch-rss` → `/api/analyze-style` 순으로 호출
   - **Claude Sonnet API**를 사용하여 블로그 문체를 분석하고 스타일 프로필 JSON 생성
2. **리뷰 생성 페이지 (`/generate`)**
   - 폼 입력 후 `/api/generate-review`를 호출해 리뷰를 만들고 `data/reviews`에 저장
   - **Claude Haiku API**를 사용하여 스타일 프로필 기반으로 1500자+ 리뷰 생성
   - 생성된 텍스트는 UI에서 바로 복사하거나 수정 요청(`/api/edit-review`)으로 재가공 가능
   - 수정 요청도 **Claude Haiku API**를 통해 자연스럽게 개선

## 환경 설정

1. `.env.local` 파일 생성 (`.env.example` 참고)
2. Anthropic API 키 발급: https://console.anthropic.com/
3. `.env.local`에 키 추가:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## 다음 단계 제안

1. 생성된 리뷰 목록/재편집 페이지 추가 (`data/reviews` 읽기)
2. RSS 크롤링 오류 케이스(비공개 포스트, 네트워크 에러 등)를 UI에 세분화하여 표시
3. 스타일 프로필 편집/재분석 기능

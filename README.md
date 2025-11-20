# 블로그 톤 기반 리뷰 자동 생성 도구

내 블로그 문체를 학습해 1500자 이상의 리뷰를 자동으로 만들어주는 로컬 전용 Next.js 앱입니다.

## 🚀 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 열어 스타일 분석 → 리뷰 생성 플로우를 바로 확인할 수 있습니다.

## 🏗️ 아키텍처 특징

### 함수형 프로그래밍 패턴
- **순수 함수**: 비즈니스 로직을 순수 함수로 분리하여 테스트 용이성 향상
- **불변성**: 상태 변경을 최소화하고 예측 가능한 데이터 흐름
- **고차 함수**: 재사용 가능한 커스텀 훅과 유틸리티 함수

### 타입 안정성
- **엄격한 타입 정의**: 모든 함수와 컴포넌트에 명시적 타입
- **타입 가드**: 런타임 타입 검증으로 안전성 보장
- **제네릭 활용**: 재사용 가능한 타입 안전 유틸리티

### 컴포넌트 설계
- **Atomic Design**: 작고 재사용 가능한 컴포넌트로 분해
- **단일 책임 원칙**: 각 컴포넌트는 하나의 역할만 수행
- **Props Drilling 방지**: 커스텀 훅으로 로직 분리

## 📁 폴더 구조

### 핵심 디렉토리

| 경로 | 설명 |
| --- | --- |
| `src/app` | App Router 기반 페이지(`/`, `/analyze`, `/generate`)와 API Routes |
| `src/components` | 재사용 가능한 UI 컴포넌트 (Atomic Design 패턴) |
| `src/hooks` | 커스텀 React 훅 (로직 재사용) |
| `src/lib` | 비즈니스 로직, 유틸리티, API 클라이언트 |
| `data/` | 런타임 데이터 저장소 (RSS 콘텐츠, 스타일 프로필, 생성된 리뷰) |
| `prompts/` | Claude API 프롬프트 템플릿 |

### 새로 추가된 파일

#### 커스텀 훅 (`src/hooks/`)
- `useLocalStorage.ts` - localStorage를 React state처럼 사용
- `useStyleProfile.ts` - 스타일 프로필 관리 (로드/저장/삭제)
- `useAsync.ts` - 비동기 작업 상태 관리

#### 유틸리티 (`src/lib/`)
- `constants.ts` - 전역 상수 (API 엔드포인트, 스타일, 메시지 등)

#### 컴포넌트 (`src/components/`)
- `style-profile-summary.tsx` - 스타일 프로필 요약 표시
  - 핵심 정보 하이라이트
  - 접기/펼치기 기능
  - 다음 단계 CTA

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

## 💡 코드 패턴 예제

### 1. 순수 함수로 비즈니스 로직 분리

```typescript
// ❌ Before: 컴포넌트 내부에 로직 혼재
const Component = () => {
  const [data, setData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/data');
    const json = await res.json();
    setData(json);
  };
};

// ✅ After: 순수 함수로 분리
const fetchData = async (): Promise<Data> => {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const Component = () => {
  const { data, execute } = useAsync(fetchData);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    execute();
  };
};
```

### 2. 커스텀 훅으로 로직 재사용

```typescript
// ✅ useStyleProfile 훅 사용
const Component = () => {
  const { styleProfile, saveProfile, loadProfile } = useStyleProfile();

  // 자동으로 마운트 시 로드됨
  // localStorage → API fallback 자동 처리
};
```

### 3. 상수로 매직 넘버/스트링 제거

```typescript
// ❌ Before
<button className="rounded-xl bg-blue-500 py-3 px-6...">

// ✅ After
import { BUTTON_STYLES } from '@/lib/constants';
<button className={BUTTON_STYLES.PRIMARY}>
```

### 4. 작은 컴포넌트로 분해

```typescript
// ✅ 각 컴포넌트는 단일 책임
const PageHeader = () => (/* 헤더만 담당 */);
const StatusMessage = ({ message, isError }) => (/* 상태 메시지만 담당 */);
const AnalysisForm = ({ onSubmit, ... }) => (/* 폼만 담당 */);
```

## 🛠️ 개발 가이드

### 새 기능 추가 시 체크리스트

1. **순수 함수 우선**: 로직을 순수 함수로 작성 → 테스트 용이
2. **타입 정의**: 모든 함수와 컴포넌트에 명시적 타입 추가
3. **상수 사용**: 반복되는 값은 `constants.ts`에 정의
4. **훅 재사용**: 비슷한 로직이면 커스텀 훅으로 추출
5. **컴포넌트 분해**: 100줄 넘으면 작은 컴포넌트로 분리

### 코드 스타일

- **ESLint/Prettier** 자동 포맷팅
- **함수형 컴포넌트** 사용 (React.FC 지양)
- **명명 규칙**:
  - 컴포넌트: PascalCase
  - 훅: use + PascalCase
  - 유틸 함수: camelCase
  - 상수: UPPER_SNAKE_CASE

## 다음 단계 제안

1. ✅ ~~스타일 분석 페이지 리팩토링~~
2. 🔄 리뷰 생성 페이지 리팩토링 (동일한 패턴 적용)
3. 📝 생성된 리뷰 목록/재편집 페이지 추가
4. 🎨 스타일 프로필 편집/재분석 기능
5. 🧪 단위 테스트 추가 (Jest + React Testing Library)

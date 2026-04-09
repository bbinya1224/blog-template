const LENGTH_CHANGE_REQUEST_PATTERN =
  /길이|분량|짧게|짧은|줄여|줄여줘|축약|간단히|요약|길게|자세히|늘려|늘려줘|확장|더 길게/;

const FACT_CHANGE_REQUEST_PATTERN =
  /메뉴|가격|금액|날짜|방문일|장소|매장명|가게명|지점|위치|주소|전화번호|상호|이름.*바꿔|정보.*수정/;

const EXPLANATION_PATTERN =
  /수정된 리뷰|수정본|아래는|변경.*반영|요청.*반영|설명|참고|다음과 같이/i;

const MARKDOWN_PATTERN = /```|^#{1,6}\s|\*\*|__|^- /m;

const PROTECTED_FACT_PATTERNS = [
  /\d{4}[./-]\d{1,2}[./-]\d{1,2}/g,
  /\d{1,2}\s*월\s*\d{1,2}\s*일/g,
  /\d{1,2}[./-]\d{1,2}/g,
  /\b(?:오늘|어제|주말|이번 주|지난주)\b/g,
  /\d[\d,]*(?:\.\d+)?\s*(?:원|만원|천원)/g,
  /\b\d{2,4}-\d{3,4}-\d{4}\b/g,
  /[가-힣A-Za-z0-9][가-힣A-Za-z0-9\s.'()&-]{0,28}(?:점|식당|카페|레스토랑|바|펍|집)/g,
] as const;

export interface EditValidationResult {
  isValid: boolean;
  hardIssues: string[];
  softIssues: string[];
  issues: string[];
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function extractProtectedFacts(text: string): string[] {
  const matches = PROTECTED_FACT_PATTERNS.flatMap((pattern) =>
    Array.from(text.matchAll(pattern), (match) => normalizeWhitespace(match[0])),
  );

  return dedupe(matches.filter((value) => value.length > 0));
}

function allowsLengthChange(editRequest: string): boolean {
  return LENGTH_CHANGE_REQUEST_PATTERN.test(editRequest);
}

function allowsFactChange(editRequest: string): boolean {
  return FACT_CHANGE_REQUEST_PATTERN.test(editRequest);
}

export function validateEditedReview(params: {
  originalReview: string;
  editedReview: string;
  editRequest: string;
}): EditValidationResult {
  const { originalReview, editedReview, editRequest } = params;
  const hardIssues: string[] = [];
  const softIssues: string[] = [];
  const normalizedEdited = editedReview.trim();

  if (!normalizedEdited) {
    hardIssues.push('수정 결과가 비어 있습니다.');
    return { isValid: false, hardIssues, softIssues, issues: hardIssues };
  }

  if (EXPLANATION_PATTERN.test(normalizedEdited)) {
    hardIssues.push('수정 결과에 설명문이나 메타 코멘트가 포함되어 있습니다.');
  }

  if (MARKDOWN_PATTERN.test(normalizedEdited)) {
    hardIssues.push('수정 결과에 마크다운 또는 리스트 문법이 포함되어 있습니다.');
  }

  if (!allowsLengthChange(editRequest)) {
    const originalLength = originalReview.trim().length;
    const editedLength = normalizedEdited.length;
    const minLength = Math.floor(originalLength * 0.9);
    const maxLength = Math.ceil(originalLength * 1.1);

    if (editedLength < minLength || editedLength > maxLength) {
      hardIssues.push('수정 결과 길이가 원본 대비 허용 범위(±10%)를 벗어났습니다.');
    }
  }

  if (!allowsFactChange(editRequest)) {
    const protectedFacts = extractProtectedFacts(originalReview);
    const missingFacts = protectedFacts.filter(
      (fact) => !normalizeWhitespace(editedReview).includes(fact),
    );

    if (missingFacts.length > 0) {
      hardIssues.push(
        `원본의 핵심 사실 표현이 누락되었습니다: ${missingFacts.slice(0, 5).join(', ')}`,
      );
    }
  }

  const originalParagraphs = originalReview
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean).length;
  const editedParagraphs = editedReview
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean).length;

  if (editedParagraphs > 0 && originalParagraphs > 0) {
    const paragraphDelta = Math.abs(editedParagraphs - originalParagraphs);
    if (paragraphDelta >= 3) {
      softIssues.push('문단 구조가 원본 대비 크게 달라졌습니다.');
    }
  }

  const originalEmojiCount = (originalReview.match(/[\u{1F300}-\u{1FAFF}]/gu) ?? []).length;
  const editedEmojiCount = (editedReview.match(/[\u{1F300}-\u{1FAFF}]/gu) ?? []).length;
  if (Math.abs(originalEmojiCount - editedEmojiCount) >= 3) {
    softIssues.push('이모지 사용 패턴이 원본과 다르게 변했습니다.');
  }

  const issues = [...hardIssues, ...softIssues];

  return {
    isValid: issues.length === 0,
    hardIssues,
    softIssues,
    issues,
  };
}

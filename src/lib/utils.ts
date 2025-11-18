/**
 * 공통 유틸리티 함수 모음
 * 순수 함수로 구성되어 재사용성과 테스트 용이성을 높임
 */

export const cn = (...classes: Array<string | undefined | null | false>) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * URL 유효성 검사
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * RSS URL 유효성 검사 (네이버 블로그 전용)
 */
export const isValidNaverRssUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;
  return url.includes('blog.naver.com/rss');
};

/**
 * 문자열이 비어있지 않은지 확인
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export const formatKoreanDate = (dateString: string): string => {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

/**
 * 파일명으로 사용 가능한 안전한 문자열 생성
 */
export const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * 배열에서 중복 제거
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * 텍스트에서 HTML 태그 제거
 */
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * 텍스트 정규화 (공백, URL 제거)
 */
export const normalizeText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/http\S+/g, '')
    .trim();
};

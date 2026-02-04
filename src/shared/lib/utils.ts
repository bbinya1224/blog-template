// ============================================
// 정규식 패턴
// ============================================

const FILENAME_UNSAFE_CHARS = /[^a-zA-Z0-9가-힣]/g;
const MULTIPLE_DASHES = /-+/g;
const LEADING_TRAILING_DASH = /^-|-$/g;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const WHITESPACE_PATTERN = /\s+/g;
const URL_PATTERN = /http\S+/g;

// ============================================
// 유틸리티 함수
// ============================================

export const cn = (...classes: Array<string | undefined | null | false>) => {
  return classes.filter(Boolean).join(' ');
};

export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidNaverRssUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;
  return url.includes('rss.blog.naver.com') && url.endsWith('.xml');
};

export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

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

export const sanitizeFileName = (name: string): string => {
  return name
    .replace(FILENAME_UNSAFE_CHARS, '-')
    .replace(MULTIPLE_DASHES, '-')
    .replace(LEADING_TRAILING_DASH, '');
};

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const stripHtmlTags = (html: string): string => {
  return html.replace(HTML_TAG_PATTERN, '');
};

export const normalizeText = (text: string): string => {
  return text.replace(WHITESPACE_PATTERN, ' ').replace(URL_PATTERN, '').trim();
};

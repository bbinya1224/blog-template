/**
 * RSS 크롤링 관련 상수 정의
 */

export const MIN_TEXT_LENGTH = 80; // 추출된 텍스트의 최소 길이
export const MIN_POST_LENGTH = 200; // 분석/샘플에 포함할 최소 글 길이
export const MAX_SAMPLE_LENGTH = 1500; // Few-shot용 샘플 최대 길이
export const MAX_MERGED_LENGTH = 4000; // 스타일 분석용 개별 글 최대 길이

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

export const DESKTOP_POST_SELECTORS = [
  '.se-main-container',
  '.se_component_wrap.sect_dsc',
  '#postViewArea',
  '.post-view',
  '#post-area',
  'article',
  '.post_ct',
];

export const MOBILE_POST_SELECTORS = [
  '.se-main-container',
  '.post_ct',
  '#contents-area',
  '.se-module.se-module-text',
  'article',
];

export const RSS_TIMEOUT_MS = 20000;

export const RSS_RETRY_OPTIONS = {
  maxAttempts: 3,
  initialDelayMs: 2000,
  maxDelayMs: 10000,
  onRetry: (attempt: number, error: unknown) => {
    const safeMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : '알 수 없는 오류';
    console.warn(`[RSS] 재시도 ${attempt}회:`, safeMessage);
  },
};

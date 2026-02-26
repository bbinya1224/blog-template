export const MIN_TEXT_LENGTH = 80;
export const MIN_POST_LENGTH = 200;
export const MAX_SAMPLE_LENGTH = 1500;
export const MAX_MERGED_LENGTH = 4000;

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

// 허용된 RSS 피드 호스트 — 새 블로그 플랫폼 추가 시 여기에 추가
export const ALLOWED_RSS_HOSTS = ['rss.blog.naver.com'];

// RSS에서 추출한 포스트 링크 중 fetch를 허용하는 호스트
export const ALLOWED_POST_HOSTS = [
  'blog.naver.com',
  'm.blog.naver.com',
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

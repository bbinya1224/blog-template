/**
 * RSS Crawler 라이브러리 Public API
 */

// 메인 함수
export { crawlBlogRss, type CrawlResult } from './rss-crawler';

// HTML 추출 유틸리티 (테스트/외부에서 사용 가능)
export {
  extractArticleText,
  extractPostLinksFromRss,
  type ExtractResult,
} from './html-extractor';

// URL 유틸리티
export {
  parseNaverBlogUrl,
  buildViewerAndMobileUrls,
  enforceHttps,
} from './url-utils';

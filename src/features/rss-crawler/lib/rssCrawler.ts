import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { RssCrawlingError } from '@/shared/lib/errors';
import { stripHtmlTags, normalizeText } from '@/shared/lib/utils';
import { withRetry } from '@/shared/lib/retry';
import {
  MIN_TEXT_LENGTH,
  MIN_POST_LENGTH,
  MAX_SAMPLE_LENGTH,
  MAX_MERGED_LENGTH,
  DESKTOP_POST_SELECTORS,
  MOBILE_POST_SELECTORS,
  RSS_TIMEOUT_MS,
  RSS_RETRY_OPTIONS,
} from './constants';
import { buildViewerAndMobileUrls } from './urlUtils';
import {
  extractArticleText,
  extractPostLinksFromRss,
  type ExtractResult,
} from './htmlExtractor';
import {
  fetchHtml,
  getRandomUserAgent,
  sleep,
  withProtocolFallback,
} from './httpClient';

export type CrawlResult = {
  mergedText: string;
  samples: string[];
};

const cleanSinglePost = (rawText: string): string => {
  const noHtml = stripHtmlTags(rawText);
  return normalizeText(noHtml);
};

export const crawlBlogRss = async (
  rssUrl: string,
  maxPosts: number,
  options?: { debug?: boolean },
): Promise<CrawlResult> => {
  const debug = options?.debug ?? false;

  try {
    // 1. RSS 피드 가져오기 (HTTPS 우선, SSL 에러 시 HTTP fallback)
    const rssResponse = await withProtocolFallback(rssUrl, (resolvedUrl) =>
      withRetry(
        () =>
          axios.get<string>(resolvedUrl, {
            timeout: RSS_TIMEOUT_MS,
            headers: {
              'User-Agent': getRandomUserAgent(),
            },
          }),
        RSS_RETRY_OPTIONS,
      ),
    );

    const postLinks = extractPostLinksFromRss(rssResponse.data, maxPosts);

    if (postLinks.length === 0) {
      throw new RssCrawlingError(
        'RSS 피드에서 포스트를 찾을 수 없습니다. URL 또는 공개 상태를 확인해주세요.',
      );
    }

    const cleanedPosts: string[] = [];
    const debugDir = path.join(process.cwd(), 'data', 'debug-html');

    if (debug && process.env.NODE_ENV !== 'production') {
      await fs.mkdir(debugDir, { recursive: true });
    }

    for (let i = 0; i < postLinks.length; i++) {
      const link = postLinks[i];
      console.log(`\n[${i + 1}/${postLinks.length}] 포스트 처리: ${link}`);

      const candidateUrls = buildViewerAndMobileUrls(link);

      let extracted: ExtractResult | null = null;

      for (let j = 0; j < candidateUrls.length; j++) {
        const url = candidateUrls[j];
        try {
          console.log(`  → 시도 URL #${j + 1}: ${url}`);

          const html = await fetchHtml(url, link);

          // [복원된 디버그 로직]
          if (debug && process.env.NODE_ENV !== 'production' && i < 3) {
            const fileName = `post-${i + 1}-${j + 1}.html`;
            const filePath = path.join(debugDir, fileName);
            await fs.writeFile(filePath, html, 'utf-8');
            console.log(`  [DEBUG] HTML 저장: ${filePath}`);
          }

          const isMobile = url.includes('m.blog.naver.com');
          const selectors = isMobile
            ? MOBILE_POST_SELECTORS
            : DESKTOP_POST_SELECTORS;

          const result = extractArticleText(html, selectors, debug && i < 3);

          if (debug && process.env.NODE_ENV !== 'production' && i < 3) {
            console.log('  [DEBUG] 사용 셀렉터:', result.selectorUsed);
            console.log('  [DEBUG] 길이 정보:', result.allResults);
          }

          if (result.text && result.text.length > MIN_TEXT_LENGTH) {
            extracted = result;
            break;
          } else {
            console.warn(
              `  ✗ 본문이 너무 짧음 (${result.text.length}자) → 다음 URL 시도`,
            );
          }
        } catch (err) {
          console.warn(
            `  ✗ URL 실패: ${url}`,
            err instanceof Error ? err.message : err,
          );
          continue;
        } finally {
          await sleep(200 + Math.random() * 500);
        }
      }

      if (!extracted) {
        console.warn(
          `[${i + 1}/${
            postLinks.length
          }] ✗ 모든 URL에서 본문 추출 실패 → 건너뜀`,
        );
        continue;
      }

      const cleanedText = cleanSinglePost(extracted.text);

      // 너무 짧은 글은 분석/샘플에서 제외
      if (cleanedText.length > MIN_POST_LENGTH) {
        cleanedPosts.push(cleanedText);
        console.log(
          `[${i + 1}/${postLinks.length}] ✓ 정제된 길이: ${
            cleanedText.length
          }자`,
        );
      }
    }

    if (cleanedPosts.length === 0) {
      throw new RssCrawlingError(
        '포스트 본문을 추출할 수 없습니다. 블로그가 비공개이거나 접근이 제한되어 있을 수 있습니다.',
      );
    }

    // 1. Samples (Few-shot용): 토큰 절약을 위해 글자수 제한
    const samples = cleanedPosts.map((post) =>
      post.length > MAX_SAMPLE_LENGTH
        ? post.slice(0, MAX_SAMPLE_LENGTH) + '...'
        : post,
    );

    // 2. MergedText (스타일 분석용): 분석 문맥을 위해 좀 더 길게
    const mergedText = cleanedPosts
      .map((post) =>
        post.length > MAX_MERGED_LENGTH
          ? post.slice(0, MAX_MERGED_LENGTH)
          : post,
      )
      .join('\n\n---\n\n');

    console.log(`\n✅ 크롤링 완료: ${cleanedPosts.length}개 포스트 수집`);
    console.log(`📦 병합 텍스트 크기: ${mergedText.length.toLocaleString()}자`);

    return {
      mergedText,
      samples,
    };
  } catch (error) {
    if (error instanceof RssCrawlingError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new RssCrawlingError(
          '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.',
        );
      }
      if (error.response?.status === 404) {
        throw new RssCrawlingError(
          'RSS 피드를 찾을 수 없습니다. URL을 확인해주세요.',
        );
      }
      if (error.response?.status === 429) {
        throw new RssCrawlingError(
          '요청이 너무 많아 잠시 차단되었습니다. 나중에 다시 시도해주세요.',
        );
      }
    }

    console.error('❗예상치 못한 오류:', error);
    throw new RssCrawlingError(
      'RSS 크롤링 중 예상치 못한 오류가 발생했습니다.',
    );
  }
};

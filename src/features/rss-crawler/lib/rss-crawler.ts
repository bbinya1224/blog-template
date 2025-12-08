import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import { RssCrawlingError } from '@/shared/lib/errors';
import { stripHtmlTags, normalizeText } from '@/shared/lib/utils';

export type CrawlResult = {
  mergedText: string;
  samples: string[];
};

const MIN_TEXT_LENGTH = 80; // 추출된 텍스트의 최소 길이
const MIN_POST_LENGTH = 200; // 분석/샘플에 포함할 최소 글 길이
const MAX_SAMPLE_LENGTH = 1500; // Few-shot용 샘플 최대 길이
const MAX_MERGED_LENGTH = 4000; // 스타일 분석용 개별 글 최대 길이

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

const getRandomUserAgent = () =>
  USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DESKTOP_POST_SELECTORS = [
  '.se-main-container',
  '.se_component_wrap.sect_dsc',
  '#postViewArea',
  '.post-view',
  '#post-area',
  'article',
  '.post_ct',
];

const MOBILE_POST_SELECTORS = [
  '.se-main-container',
  '.post_ct',
  '#contents-area',
  '.se-module.se-module-text',
  'article',
];

/**
 * RSS XML에서 포스트 링크 추출 (순수 함수)
 */
export const extractPostLinksFromRss = (
  rssXml: string,
  maxPosts: number
): string[] => {
  const $rss = cheerio.load(rssXml, { xmlMode: true });
  const links: string[] = [];

  $rss('item')
    .slice(0, maxPosts)
    .each((_, element) => {
      const link = $rss(element).find('link').text().trim();
      if (link) links.push(link);
    });

  return links;
};

/**
 * 네이버 블로그 원본 URL에서 blogId, logNo 추출
 * - https://blog.naver.com/bbinjjam/224688244...
 * - https://m.blog.naver.com/bbinjjam/224688244...
 */
const parseNaverBlogUrl = (
  url: string
): { blogId?: string; logNo?: string } => {
  try {
    const u = new URL(url);
    const [blogId, logNo] = u.pathname.split('/').filter(Boolean);
    const searchLogNo = u.searchParams.get('logNo');

    return {
      blogId,
      logNo: logNo || searchLogNo || undefined,
    };
  } catch {
    return {};
  }
};

/**
 * viewer / mobile URL 생성
 */
const buildViewerAndMobileUrls = (originalUrl: string) => {
  const { blogId, logNo } = parseNaverBlogUrl(originalUrl);
  const urls: string[] = [];

  if (blogId && logNo) {
    urls.push(
      `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`
    );
    urls.push(`https://m.blog.naver.com/${blogId}/${logNo}`);
  }

  urls.push(originalUrl);

  return urls;
};

type ExtractResult = {
  text: string;
  selectorUsed?: string;
  allResults?: Record<string, number>;
};

const removeNoiseNodes = ($: cheerio.CheerioAPI) => {
  // 광고, 댓글, 공유, 스크립트 등 제거
  [
    'style',
    'script',
    'noscript',
    'iframe',
    '.naver-splugin',
    '.u_cbox',
    '#comment',
    '.reply',
    '[data-role="ad"]',
    '.ad_area',
    '.ad_wrap',
  ].forEach((sel) => $(sel).remove());
};

/**
 * HTML에서 본문 텍스트 추출
 * - 우선순위 셀렉터 기반
 * - 길이 기준은 보조 지표
 */
export const extractArticleText = (
  html: string,
  selectors: string[],
  debug = false
): ExtractResult => {
  const $ = cheerio.load(html);
  removeNoiseNodes($);

  let bestText = '';
  let bestSelector = '';
  const allResults: Record<string, number> = {};

  for (const selector of selectors) {
    const el = $(selector);
    if (!el.length) {
      allResults[selector] = 0;
      continue;
    }

    const text = el
      .text()
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    allResults[selector] = text.length;

    if (!bestText && text.length > 200) {
      bestText = text;
      bestSelector = selector;
    }

    if (text.length > bestText.length) {
      bestText = text;
      bestSelector = selector;
    }
  }

  if (!bestText) {
    const bodyText = $('body')
      .text()
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    bestText = bodyText;
    bestSelector = 'body (fallback)';
    allResults['body'] = bodyText.length;
  }

  if (debug) {
    return { text: bestText, selectorUsed: bestSelector, allResults };
  }
  return { text: bestText };
};

const cleanSinglePost = (rawText: string): string => {
  const noHtml = stripHtmlTags(rawText);
  return normalizeText(noHtml);
};

const fetchHtml = async (url: string, referer?: string) => {
  const res = await axios.get<string>(url, {
    timeout: 20000,
    headers: {
      'User-Agent': getRandomUserAgent(),
      Referer: referer || 'https://blog.naver.com',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Upgrade-Insecure-Requests': '1',
    },
  });
  return res.data;
};

const enforceHttps = (url: string): string => {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

export const crawlBlogRss = async (
  rssUrl: string,
  maxPosts: number,
  options?: { debug?: boolean }
): Promise<CrawlResult> => {
  const debug = options?.debug ?? false;

  try {
    // 1. RSS URL HTTPS 강제
    const secureRssUrl = enforceHttps(rssUrl);
    
    const rssResponse = await axios.get<string>(secureRssUrl, {
      timeout: 20000,
      headers: {
        'User-Agent': getRandomUserAgent(),
      },
    });

    const postLinks = extractPostLinksFromRss(rssResponse.data, maxPosts);

    if (postLinks.length === 0) {
      throw new RssCrawlingError(
        'RSS 피드에서 포스트를 찾을 수 없습니다. URL 또는 공개 상태를 확인해주세요.'
      );
    }

    const cleanedPosts: string[] = [];
    const debugDir = path.join(process.cwd(), 'data', 'debug-html');

    if (debug) {
      await fs.mkdir(debugDir, { recursive: true });
    }

    for (let i = 0; i < postLinks.length; i++) {
      const link = postLinks[i];
      console.log(`\n[${i + 1}/${postLinks.length}] 포스트 처리: ${link}`);

      const candidateUrls = buildViewerAndMobileUrls(link);

      let extracted: ExtractResult | null = null;

      for (let j = 0; j < candidateUrls.length; j++) {
        const url = enforceHttps(candidateUrls[j]);
        try {
          console.log(`  → 시도 URL #${j + 1}: ${url}`);

          const html = await fetchHtml(url, link);

          // [복원된 디버그 로직]
          if (debug && i < 3) {
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

          if (debug && i < 3) {
            console.log('  [DEBUG] 사용 셀렉터:', result.selectorUsed);
            console.log('  [DEBUG] 길이 정보:', result.allResults);
          }

          if (result.text && result.text.length > MIN_TEXT_LENGTH) {
            extracted = result;
            break;
          } else {
            console.warn(
              `  ✗ 본문이 너무 짧음 (${result.text.length}자) → 다음 URL 시도`
            );
          }
        } catch (err) {
          console.warn(
            `  ✗ URL 실패: ${url}`,
            err instanceof Error ? err.message : err
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
          }] ✗ 모든 URL에서 본문 추출 실패 → 건너뜀`
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
          }자`
        );
      }
    }

    if (cleanedPosts.length === 0) {
      throw new RssCrawlingError(
        '포스트 본문을 추출할 수 없습니다. 블로그가 비공개이거나 접근이 제한되어 있을 수 있습니다.'
      );
    }

    // 1. Samples (Few-shot용): 토큰 절약을 위해 글자수 제한
    const samples = cleanedPosts.map((post) =>
      post.length > MAX_SAMPLE_LENGTH
        ? post.slice(0, MAX_SAMPLE_LENGTH) + '...'
        : post
    );

    // 2. MergedText (스타일 분석용): 분석 문맥을 위해 좀 더 길게
    const mergedText = cleanedPosts
      .map((post) =>
        post.length > MAX_MERGED_LENGTH
          ? post.slice(0, MAX_MERGED_LENGTH)
          : post
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
          '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.'
        );
      }
      if (error.response?.status === 404) {
        throw new RssCrawlingError(
          'RSS 피드를 찾을 수 없습니다. URL을 확인해주세요.'
        );
      }
      if (error.response?.status === 429) {
        throw new RssCrawlingError(
          '요청이 너무 많아 잠시 차단되었습니다. 나중에 다시 시도해주세요.'
        );
      }
    }

    console.error('❗예상치 못한 오류:', error);
    throw new RssCrawlingError(
      'RSS 크롤링 중 예상치 못한 오류가 발생했습니다.'
    );
  }
};

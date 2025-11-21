/**
 * 개선된 RSS 크롤링 모듈 (네이버 블로그 전용)
 *
 * 주요 변경점
 * - 모바일 뷰 / viewer URL까지 fallback
 * - User-Agent 로테이션 + 랜덤 딜레이로 차단 위험 감소
 * - 본문 셀렉터 우선순위 명시 (길이 기준만 의존 X)
 * - 문단/줄바꿈 보존을 고려한 정제
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import { RssCrawlingError } from '@/shared/lib/errors';
import { stripHtmlTags, normalizeText } from '@/shared/lib/utils';

/* =========================
 * UA 로테이션 & 유틸
 * ========================= */

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

const getRandomUserAgent = () =>
  USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* =========================
 * 네이버 블로그 셀렉터 정의
 * ========================= */

/**
 * bbinjjam 블로그에 특화된 우선순위 셀렉터 (필요시 수정)
 * 상단일수록 우선순위가 높음
 */
const DESKTOP_POST_SELECTORS = [
  '.se-main-container', // 스마트에디터(신규)
  '.se_component_wrap.sect_dsc', // 일부 스타일
  '#postViewArea', // 구 에디터
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

/* =========================
 * RSS XML 파싱
 * ========================= */

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

/* =========================
 * 네이버 URL 정규화
 * ========================= */

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
    // path: /{blogId}/{logNo}
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
    // viewer 모드
    urls.push(
      `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`
    );
    // 모바일 모드
    urls.push(`https://m.blog.naver.com/${blogId}/${logNo}`);
  }

  // 마지막으로 원본도 fallback으로 추가
  urls.push(originalUrl);

  return urls;
};

/* =========================
 * HTML -> 본문 추출
 * ========================= */

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

    // 줄바꿈을 어느 정도 보존하기 위해 <p>, <br> 기준으로 처리해도 좋음
    const text = el
      .text()
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    allResults[selector] = text.length;

    // 1) 우선 첫 번째로 "충분히 긴" 텍스트면 우선 채택
    if (!bestText && text.length > 200) {
      bestText = text;
      bestSelector = selector;
    }

    // 2) 이후에는 더 긴 텍스트가 등장하면 교체
    if (text.length > bestText.length) {
      bestText = text;
      bestSelector = selector;
    }
  }

  // 셀렉터가 모두 실패한 경우 body fallback
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

/* =========================
 * 포스트 병합/정제
 * ========================= */

/**
 * 여러 포스트를 병합하고 정제
 * - 각 포스트 최대 maxCharsPerPost까지 사용 (스타일 분석용이면 6000~8000 추천)
 * - 문단 경계 구분을 위해 --- 구분자 사용
 */
export const mergeAndCleanPosts = (
  posts: string[],
  maxCharsPerPost = 6000
): string => {
  const trimmed = posts.map((post) => {
    const t =
      post.length > maxCharsPerPost
        ? post.substring(0, maxCharsPerPost) + '...'
        : post;
    return `---\n${t}`;
  });

  const merged = trimmed.join('\n\n');

  // stripHtmlTags가 줄바꿈까지 다 날려버리지 않도록 구현되어 있다고 가정
  const withoutHtml = stripHtmlTags(merged);
  return normalizeText(withoutHtml);
};

/* =========================
 * HTTP fetch util
 * ========================= */

const fetchHtml = async (url: string, referer?: string) => {
  const res = await axios.get<string>(url, {
    timeout: 20000,
    headers: {
      'User-Agent': getRandomUserAgent(),
      Referer: referer || 'https://blog.naver.com',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    // 필요하면 withCredentials, cookie 등 추가
  });
  return res.data;
};

/* =========================
 * 메인: RSS 크롤링
 * ========================= */

export const crawlBlogRss = async (
  rssUrl: string,
  maxPosts: number,
  options?: { debug?: boolean }
): Promise<string> => {
  const debug = options?.debug ?? false;

  try {
    // 1. RSS 다운로드
    const rssResponse = await axios.get<string>(rssUrl, {
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

    const postTexts: string[] = [];
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
        const url = candidateUrls[j];
        try {
          console.log(`  → 시도 URL #${j + 1}: ${url}`);

          const html = await fetchHtml(url, link);

          if (debug && i < 3) {
            const fileName = `post-${i + 1}-${j + 1}.html`;
            const filePath = path.join(debugDir, fileName);
            await fs.writeFile(filePath, html, 'utf-8');
            console.log(`  [DEBUG] HTML 저장: ${filePath}`);
          }

          // URL 패턴에 따라 데스크탑/모바일 셀렉터 선택
          const isMobile = url.includes('m.blog.naver.com');
          const selectors = isMobile
            ? MOBILE_POST_SELECTORS
            : DESKTOP_POST_SELECTORS;

          const result = extractArticleText(html, selectors, debug && i < 3);

          if (debug && i < 3) {
            console.log('  [DEBUG] 사용 셀렉터:', result.selectorUsed);
            console.log('  [DEBUG] 길이 정보:', result.allResults);
          }

          if (result.text && result.text.length > 80) {
            extracted = result;
            break; // 이 URL에서 성공했으니 다음 포스트로
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
          // 네이버 차단 방지를 위한 랜덤 딜레이 (200~700ms)
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

      console.log(
        `[${i + 1}/${postLinks.length}] ✓ 본문 길이: ${extracted.text.length}자`
      );
      postTexts.push(extracted.text);
    }

    if (postTexts.length === 0) {
      throw new RssCrawlingError(
        '포스트 본문을 추출할 수 없습니다. 블로그가 비공개이거나 접근이 제한되어 있을 수 있습니다.'
      );
    }

    const totalChars = postTexts.reduce((sum, t) => sum + t.length, 0);
    console.log(`\n✅ 크롤링 완료: ${postTexts.length}개 포스트 수집`);
    console.log(`📝 병합 전 총 문자 수: ${totalChars.toLocaleString()}자`);

    const merged = mergeAndCleanPosts(postTexts);

    console.log(
      `📦 병합 후 최종 텍스트: ${merged.length.toLocaleString()}자 (포스트당 최대 6000자)`
    );
    console.log(
      `💡 대략 토큰 수(한글 기준 2.5자/토큰): 약 ${Math.ceil(
        merged.length / 2.5
      ).toLocaleString()} 토큰`
    );

    return merged;
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

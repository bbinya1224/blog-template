/**
 * HTML에서 본문 텍스트 추출 로직
 */

import * as cheerio from 'cheerio';

export type ExtractResult = {
  text: string;
  selectorUsed?: string;
  allResults?: Record<string, number>;
};

/**
 * 노이즈 노드 제거 (광고, 댓글, 스크립트 등)
 */
const removeNoiseNodes = ($: cheerio.CheerioAPI) => {
  const selectors = [
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
  ];
  for (const sel of selectors) {
    $(sel).remove();
  }
};

/**
 * 본문 텍스트로 간주할 최소 길이 (문자 수)
 * - 200자 미만은 메타 정보, 요약 등으로 판단
 */
const MIN_CONTENT_LENGTH = 200;

/**
 * 추출된 텍스트 정규화 (중복 개행 제거, trim)
 */
const normalizeText = (rawText: string): string =>
  rawText.replace(/\n{3,}/g, '\n\n').trim();

/**
 * 셀렉터 기반 텍스트 추출 결과
 */
type SelectorResult = {
  selector: string;
  text: string;
  length: number;
};

/**
 * HTML에서 본문 텍스트 추출
 * - 우선순위 셀렉터 기반 (배열 순서대로 우선)
 * - MIN_CONTENT_LENGTH 이상인 것만 유효로 간주
 * - 유효한 결과 중 가장 긴 텍스트 선택
 * - 유효한 결과 없으면 body fallback
 */
export const extractArticleText = (
  html: string,
  selectors: string[],
  debug = false,
): ExtractResult => {
  const $ = cheerio.load(html);
  removeNoiseNodes($);

  // 1. 모든 셀렉터에 대한 결과 수집 (선언형)
  const selectorResults: SelectorResult[] = selectors.map((selector) => {
    const el = $(selector);
    if (!el.length) {
      return { selector, text: '', length: 0 };
    }

    const text = normalizeText(el.text());
    return { selector, text, length: text.length };
  });

  // 2. allResults 구성 (디버깅용)
  const allResults = Object.fromEntries(
    selectorResults.map((r) => [r.selector, r.length]),
  );

  // 3. 유효한 결과 필터링 및 최장 텍스트 선택
  const validResults = selectorResults.filter(
    (r) => r.length >= MIN_CONTENT_LENGTH,
  );

  const bestResult = validResults.reduce<SelectorResult | null>(
    (best, current) => {
      if (!best) return current;
      return current.length > best.length ? current : best;
    },
    null,
  );

  // 4. 유효한 결과가 있으면 반환, 없으면 body fallback
  const shouldUseFallback =
    !bestResult || bestResult.length < MIN_CONTENT_LENGTH;

  if (shouldUseFallback) {
    const bodyText = normalizeText($('body').text());
    allResults['body'] = bodyText.length;

    return debug
      ? { text: bodyText, selectorUsed: 'body (fallback)', allResults }
      : { text: bodyText };
  }

  return debug
    ? { text: bestResult.text, selectorUsed: bestResult.selector, allResults }
    : { text: bestResult.text };
};

/**
 * RSS XML에서 포스트 링크 추출
 */
export const extractPostLinksFromRss = (
  rssXml: string,
  maxPosts: number,
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

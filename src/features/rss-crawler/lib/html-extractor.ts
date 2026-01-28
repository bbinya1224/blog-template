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
  debug = false,
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

/**
 * RSS XML에서 포스트 링크 추출 (순수 함수)
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

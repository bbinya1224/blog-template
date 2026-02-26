import * as cheerio from 'cheerio';

export type ExtractResult = {
  text: string;
  selectorUsed?: string;
  allResults?: Record<string, number>;
};

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

const MIN_CONTENT_LENGTH = 200;

const normalizeText = (rawText: string): string =>
  rawText.replace(/\n{3,}/g, '\n\n').trim();

type SelectorResult = {
  selector: string;
  text: string;
  length: number;
};

export const extractArticleText = (
  html: string,
  selectors: string[],
  debug = false,
): ExtractResult => {
  const $ = cheerio.load(html);
  removeNoiseNodes($);

  const selectorResults: SelectorResult[] = selectors.map((selector) => {
    const el = $(selector);
    if (!el.length) {
      return { selector, text: '', length: 0 };
    }

    const text = normalizeText(el.text());
    return { selector, text, length: text.length };
  });

  const allResults = Object.fromEntries(
    selectorResults.map((r) => [r.selector, r.length]),
  );

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

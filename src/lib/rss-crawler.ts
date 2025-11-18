/**
 * RSS 크롤링 모듈
 * 비즈니스 로직을 순수 함수로 분리하고 I/O는 별도로 처리
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { RssCrawlingError } from './errors';
import { stripHtmlTags, normalizeText } from './utils';

const POST_SELECTORS = ['.se-main-container', '.post-view', 'article'];

/**
 * RSS XML에서 포스트 링크 추출 (순수 함수)
 */
const extractPostLinksFromRss = (
  rssXml: string,
  maxPosts: number,
): string[] => {
  const $rss = cheerio.load(rssXml, { xmlMode: true });
  const links: string[] = [];

  $rss('item')
    .slice(0, maxPosts)
    .each((_, element) => {
      const link = $rss(element).find('link').text().trim();
      if (link) {
        links.push(link);
      }
    });

  return links;
};

/**
 * HTML에서 본문 텍스트 추출 (순수 함수)
 */
const extractArticleText = (html: string): string => {
  const $ = cheerio.load(html);
  const selector = POST_SELECTORS.join(', ');
  return $(selector).text() || $('body').text() || '';
};

/**
 * 여러 포스트 텍스트를 병합하고 정제 (순수 함수)
 */
const mergeAndCleanPosts = (posts: string[]): string => {
  const merged = posts.map((post) => `---\n${post}`).join('\n');
  const withoutHtml = stripHtmlTags(merged);
  return normalizeText(withoutHtml);
};

/**
 * RSS Feed에서 블로그 포스트 크롤링
 * I/O 작업과 비즈니스 로직을 분리한 구조
 */
export const crawlBlogRss = async (
  rssUrl: string,
  maxPosts: number,
): Promise<string> => {
  try {
    // 1. RSS Feed 다운로드
    const rssResponse = await axios.get<string>(rssUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogCrawler/1.0)',
      },
    });

    // 2. 포스트 링크 추출 (순수 함수)
    const postLinks = extractPostLinksFromRss(rssResponse.data, maxPosts);

    if (postLinks.length === 0) {
      throw new RssCrawlingError(
        'RSS 피드에서 포스트를 찾을 수 없습니다. URL을 확인해주세요.',
      );
    }

    // 3. 각 포스트 크롤링
    const postTexts: string[] = [];
    for (const link of postLinks) {
      try {
        const postResponse = await axios.get<string>(link, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BlogCrawler/1.0)',
          },
        });
        const text = extractArticleText(postResponse.data);
        if (text) {
          postTexts.push(text);
        }
      } catch (error) {
        // 개별 포스트 크롤링 실패는 로그만 남기고 계속 진행
        console.warn(`포스트 크롤링 실패: ${link}`, error);
      }
    }

    if (postTexts.length === 0) {
      throw new RssCrawlingError(
        '포스트 본문을 추출할 수 없습니다. 블로그가 비공개이거나 접근이 제한되어 있을 수 있습니다.',
      );
    }

    // 4. 텍스트 병합 및 정제 (순수 함수)
    return mergeAndCleanPosts(postTexts);
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
    }

    throw new RssCrawlingError(
      'RSS 크롤링 중 예상치 못한 오류가 발생했습니다.',
    );
  }
};

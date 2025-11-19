/**
 * RSS 크롤링 모듈
 * 비즈니스 로직을 순수 함수로 분리하고 I/O는 별도로 처리
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { RssCrawlingError } from './errors';
import { stripHtmlTags, normalizeText } from './utils';

// 네이버 블로그 iframe 내부 셀렉터 (우선순위 순)
const POST_SELECTORS = [
  '.se-main-container', // 스마트에디터 ONE/3.0 (가장 일반적)
  '#postViewArea', // 구 에디터
  '.se_component_wrap', // 스마트에디터 컴포넌트
  '.post-view', // 일부 구버전
  '#post-area', // 또 다른 구버전
  'article',
  '.post_ct',
];

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
 * 네이버 블로그 메인 페이지에서 iframe URL 추출 (순수 함수)
 */
const extractIframeUrl = (html: string): string | null => {
  const $ = cheerio.load(html);

  // 네이버 블로그는 mainFrame이라는 id를 가진 iframe 사용
  const iframeSrc = $('#mainFrame').attr('src');
  if (iframeSrc) {
    // 상대 URL이면 절대 URL로 변환
    if (iframeSrc.startsWith('//')) {
      return `https:${iframeSrc}`;
    }
    if (iframeSrc.startsWith('/')) {
      return `https://blog.naver.com${iframeSrc}`;
    }
    return iframeSrc;
  }

  // 다른 iframe도 시도
  const anyIframe = $('iframe').first().attr('src');
  if (anyIframe) {
    if (anyIframe.startsWith('//')) {
      return `https:${anyIframe}`;
    }
    if (anyIframe.startsWith('/')) {
      return `https://blog.naver.com${anyIframe}`;
    }
    return anyIframe;
  }

  return null;
};

/**
 * HTML에서 본문 텍스트 추출 (순수 함수)
 * 여러 셀렉터를 시도하고 가장 긴 텍스트를 반환
 */
const extractArticleText = (
  html: string,
  debug = false,
): { text: string; selectorUsed?: string; allResults?: Record<string, number> } => {
  const $ = cheerio.load(html);

  // ⚠️ 중요: style, script, noscript 태그 제거 (CSS/JS 코드 제외)
  $('style, script, noscript').remove();

  let longestText = '';
  let bestSelector = '';
  const allResults: Record<string, number> = {};

  // 각 셀렉터를 시도하여 가장 긴 텍스트를 찾음
  for (const selector of POST_SELECTORS) {
    const element = $(selector);
    if (element.length > 0) {
      const text = element.text().trim();
      allResults[selector] = text.length;

      if (text.length > longestText.length) {
        longestText = text;
        bestSelector = selector;
      }
    } else {
      allResults[selector] = 0;
    }
  }

  // 모든 셀렉터가 실패하면 body 전체 사용
  if (!longestText) {
    longestText = $('body').text().trim();
    bestSelector = 'body (fallback)';
    allResults['body'] = longestText.length;
  }

  if (debug) {
    return { text: longestText, selectorUsed: bestSelector, allResults };
  }

  return { text: longestText };
};

/**
 * 여러 포스트 텍스트를 병합하고 정제 (순수 함수)
 * 각 포스트는 최대 3000자로 제한하여 토큰 사용량 조절
 */
const mergeAndCleanPosts = (posts: string[], maxCharsPerPost = 3000): string => {
  const trimmedPosts = posts.map((post) => {
    // 각 포스트를 최대 길이로 제한
    const trimmed = post.length > maxCharsPerPost
      ? post.substring(0, maxCharsPerPost) + '...'
      : post;
    return `---\n${trimmed}`;
  });

  const merged = trimmedPosts.join('\n');
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
    const debugDir = path.join(process.cwd(), 'data', 'debug-html');

    // 디버그 디렉토리 생성 (첫 번째 포스트에서만)
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }

    for (let i = 0; i < postLinks.length; i++) {
      const link = postLinks[i];
      try {
        console.log(`[${i + 1}/${postLinks.length}] 포스트 크롤링 시작: ${link}`);

        // Step 1: 메인 페이지 fetch (iframe 찾기 위함)
        const mainPageResponse = await axios.get<string>(link, {
          timeout: 10000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        // 디버그 모드: 메인 페이지 저장
        if (i < 3) {
          const mainFileName = `post-${i + 1}-main.html`;
          const mainFilePath = path.join(debugDir, mainFileName);
          fs.writeFileSync(mainFilePath, mainPageResponse.data);
          console.log(`[DEBUG] 메인 페이지 저장: ${mainFilePath}`);
        }

        // Step 2: iframe URL 추출
        const iframeUrl = extractIframeUrl(mainPageResponse.data);

        if (!iframeUrl) {
          console.warn(
            `[${i + 1}/${postLinks.length}] ✗ iframe을 찾을 수 없어 메인 페이지에서 직접 추출 시도`,
          );
          // iframe이 없으면 메인 페이지에서 직접 추출 시도
          const result = extractArticleText(mainPageResponse.data, i < 3);

          if (i < 3) {
            console.log(`[DEBUG] 셀렉터 결과 (메인):`, result.allResults);
            console.log(`[DEBUG] 사용된 셀렉터: ${result.selectorUsed}`);
          }

          if (result.text && result.text.length > 100) {
            postTexts.push(result.text);
            console.log(
              `[${i + 1}/${postLinks.length}] ✓ 포스트 추가 완료 (총 ${postTexts.length}개) - ${result.text.length}자`,
            );
          }
          continue;
        }

        console.log(`[${i + 1}/${postLinks.length}] iframe URL 발견: ${iframeUrl}`);

        // Step 3: iframe 내용 fetch
        const iframeResponse = await axios.get<string>(iframeUrl, {
          timeout: 10000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: link, // 네이버는 Referer 체크할 수 있음
          },
        });

        // 디버그 모드: iframe 내용 저장
        if (i < 3) {
          const iframeFileName = `post-${i + 1}-iframe.html`;
          const iframeFilePath = path.join(debugDir, iframeFileName);
          fs.writeFileSync(iframeFilePath, iframeResponse.data);
          console.log(`[DEBUG] iframe 내용 저장: ${iframeFilePath}`);
        }

        // Step 4: iframe 내용에서 본문 추출
        const result = extractArticleText(iframeResponse.data, i < 3);

        if (i < 3) {
          console.log(`[DEBUG] 셀렉터 결과 (iframe):`, result.allResults);
          console.log(`[DEBUG] 사용된 셀렉터: ${result.selectorUsed}`);
        }

        console.log(
          `[${i + 1}/${postLinks.length}] 추출된 텍스트 길이: ${result.text.length}자`,
        );

        if (result.text && result.text.length > 100) {
          // 최소 100자 이상만 유효한 것으로 간주
          postTexts.push(result.text);
          console.log(
            `[${i + 1}/${postLinks.length}] ✓ 포스트 추가 완료 (총 ${postTexts.length}개) - ${result.text.length}자`,
          );
        } else {
          console.warn(
            `[${i + 1}/${postLinks.length}] ✗ 텍스트가 너무 짧아 건너뜀 (${result.text.length}자)`,
          );
        }
      } catch (error) {
        // 개별 포스트 크롤링 실패는 로그만 남기고 계속 진행
        console.warn(`[${i + 1}/${postLinks.length}] 포스트 크롤링 실패: ${link}`, error);
      }
    }

    if (postTexts.length === 0) {
      throw new RssCrawlingError(
        '포스트 본문을 추출할 수 없습니다. 블로그가 비공개이거나 접근이 제한되어 있을 수 있습니다.',
      );
    }

    // 4. 텍스트 병합 및 정제 (순수 함수)
    console.log(
      `\n✅ 크롤링 완료: 총 ${postTexts.length}개 포스트 수집 완료`,
    );
    console.log(`📝 병합 전 총 문자 수: ${postTexts.reduce((sum, text) => sum + text.length, 0).toLocaleString()}자`);

    const merged = mergeAndCleanPosts(postTexts);

    console.log(
      `📦 병합 후 최종 텍스트: ${merged.length.toLocaleString()}자 (각 포스트 최대 3000자로 제한됨)`,
    );
    console.log(`💡 예상 토큰 수: 약 ${Math.ceil(merged.length / 3).toLocaleString()} 토큰\n`);

    return merged;
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

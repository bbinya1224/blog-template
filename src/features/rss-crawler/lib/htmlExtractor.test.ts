import { describe, expect, it } from 'vitest';
import { extractArticleText, extractPostLinksFromRss } from './htmlExtractor';

const MIN_CONTENT_LENGTH = 200;

const makeHtml = (content: string, selector = 'div.article') =>
  `<html><body><${selector.replace(/^[.\w]+/, (m) => {
    const tag = m.replace(/\..*/, '');
    const cls = m.match(/\.(\w+)/)?.[1];
    return cls ? `${tag || 'div'} class="${cls}"` : tag;
  })}>${content}</${selector.split('.')[0] || 'div'}></body></html>`;

const longText = (n = MIN_CONTENT_LENGTH + 1) => 'a'.repeat(n);

describe('extractArticleText', () => {
  describe('셀렉터로 텍스트 추출', () => {
    it('매칭 셀렉터가 있고 충분한 길이면 해당 텍스트를 반환한다', () => {
      const text = longText();
      const html = `<html><body><div class="article">${text}</div></body></html>`;
      const result = extractArticleText(html, ['.article']);
      expect(result.text).toBe(text);
    });

    it('여러 셀렉터 중 가장 긴 텍스트를 반환한다', () => {
      const shortText = longText(MIN_CONTENT_LENGTH + 1);
      const longContent = longText(MIN_CONTENT_LENGTH + 100);
      const html = `<html><body>
        <div class="short">${shortText}</div>
        <div class="long">${longContent}</div>
      </body></html>`;
      const result = extractArticleText(html, ['.short', '.long']);
      expect(result.text).toBe(longContent);
    });

    it('텍스트 앞뒤 공백을 제거한다', () => {
      const text = longText();
      const html = `<html><body><div class="article">   ${text}   </div></body></html>`;
      const result = extractArticleText(html, ['.article']);
      expect(result.text).toBe(text);
    });

    it('3개 이상 연속 개행을 2개로 정규화한다', () => {
      const text = 'a'.repeat(100) + '\n\n\n\n' + 'b'.repeat(100) + '\n\n\n' + 'c'.repeat(10);
      const html = `<html><body><div class="article">${text}</div></body></html>`;
      const result = extractArticleText(html, ['.article']);
      expect(result.text).not.toMatch(/\n{3,}/);
    });
  });

  describe('매칭 셀렉터 없거나 내용이 짧을 때 폴백', () => {
    it('셀렉터가 없으면 body 텍스트를 반환한다', () => {
      const bodyContent = longText();
      const html = `<html><body>${bodyContent}</body></html>`;
      const result = extractArticleText(html, ['.nonexistent']);
      expect(result.text).toBe(bodyContent);
    });

    it('셀렉터가 매칭되더라도 텍스트가 200자 미만이면 body로 폴백한다', () => {
      const shortContent = 'short';
      const bodyContent = longText();
      const html = `<html><body><div class="article">${shortContent}</div>${bodyContent}</body></html>`;
      const result = extractArticleText(html, ['.article']);
      expect(result.text.length).toBeGreaterThanOrEqual(MIN_CONTENT_LENGTH);
    });

    it('빈 셀렉터 배열이면 body 텍스트를 반환한다', () => {
      const bodyContent = longText();
      const html = `<html><body>${bodyContent}</body></html>`;
      const result = extractArticleText(html, []);
      expect(result.text).toBe(bodyContent);
    });
  });

  describe('노이즈 노드 제거', () => {
    it('script 태그 내용을 제거한다', () => {
      const content = longText();
      const html = `<html><body><div class="article">${content}<script>alert('noise')</script></div></body></html>`;
      const result = extractArticleText(html, ['.article']);
      expect(result.text).not.toContain('alert');
    });

    it('style 태그 내용을 제거한다', () => {
      const content = longText();
      const html = `<html><body><div class="article">${content}<style>.noise { color: red; }</style></div></body></html>`;
      const result = extractArticleText(html, ['.article']);
      expect(result.text).not.toContain('.noise');
    });
  });

  describe('debug 모드', () => {
    it('debug=true이면 selectorUsed와 allResults를 포함한다', () => {
      const text = longText();
      const html = `<html><body><div class="article">${text}</div></body></html>`;
      const result = extractArticleText(html, ['.article'], true);
      expect(result.selectorUsed).toBe('.article');
      expect(result.allResults).toBeDefined();
      expect(result.allResults!['.article']).toBeGreaterThanOrEqual(MIN_CONTENT_LENGTH);
    });

    it('폴백 시 debug=true이면 selectorUsed가 "body (fallback)"이다', () => {
      const html = `<html><body>${longText()}</body></html>`;
      const result = extractArticleText(html, ['.nonexistent'], true);
      expect(result.selectorUsed).toBe('body (fallback)');
      expect(result.allResults?.['body']).toBeGreaterThan(0);
    });

    it('debug=false(기본값)이면 selectorUsed와 allResults가 없다', () => {
      const text = longText();
      const html = `<html><body><div class="article">${text}</div></body></html>`;
      const result = extractArticleText(html, ['.article']);
      expect(result.selectorUsed).toBeUndefined();
      expect(result.allResults).toBeUndefined();
    });
  });
});

describe('extractPostLinksFromRss', () => {
  const makeRss = (links: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    ${links.map((link) => `<item><link>${link}</link></item>`).join('\n    ')}
  </channel>
</rss>`;

  it('RSS XML에서 link를 추출한다', () => {
    const rss = makeRss(['https://blog.naver.com/a/1', 'https://blog.naver.com/b/2']);
    const result = extractPostLinksFromRss(rss, 10);
    expect(result).toEqual(['https://blog.naver.com/a/1', 'https://blog.naver.com/b/2']);
  });

  it('maxPosts 수만큼만 추출한다', () => {
    const links = Array.from({ length: 5 }, (_, i) => `https://blog.naver.com/post/${i}`);
    const rss = makeRss(links);
    const result = extractPostLinksFromRss(rss, 3);
    expect(result).toHaveLength(3);
    expect(result).toEqual(links.slice(0, 3));
  });

  it('maxPosts가 아이템 수보다 크면 전체를 반환한다', () => {
    const links = ['https://blog.naver.com/a/1', 'https://blog.naver.com/b/2'];
    const rss = makeRss(links);
    const result = extractPostLinksFromRss(rss, 100);
    expect(result).toHaveLength(2);
  });

  it('item이 없는 빈 RSS는 빈 배열을 반환한다', () => {
    const rss = `<?xml version="1.0"?><rss><channel></channel></rss>`;
    const result = extractPostLinksFromRss(rss, 10);
    expect(result).toEqual([]);
  });

  it('link가 비어있는 item은 건너뛴다', () => {
    const rss = `<?xml version="1.0"?>
<rss><channel>
  <item><link></link></item>
  <item><link>https://blog.naver.com/a/1</link></item>
</channel></rss>`;
    const result = extractPostLinksFromRss(rss, 10);
    expect(result).toEqual(['https://blog.naver.com/a/1']);
  });

  it('유효하지 않은 XML은 빈 배열을 반환한다', () => {
    const result = extractPostLinksFromRss('not xml at all', 10);
    expect(result).toEqual([]);
  });

  it('maxPosts가 0이면 빈 배열을 반환한다', () => {
    const rss = makeRss(['https://blog.naver.com/a/1']);
    const result = extractPostLinksFromRss(rss, 0);
    expect(result).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import {
  cn,
  isValidUrl,
  isValidNaverRssUrl,
  isNonEmptyString,
  formatKoreanDate,
  formatReviewDate,
  sanitizeFileName,
  unique,
  stripHtmlTags,
  normalizeText,
} from './utils';

describe('cn', () => {
  it('여러 클래스를 공백으로 합친다', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('undefined를 무시한다', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('null을 무시한다', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('false를 무시한다', () => {
    expect(cn('foo', false, 'bar')).toBe('foo bar');
  });

  it('인수가 없으면 빈 문자열을 반환한다', () => {
    expect(cn()).toBe('');
  });

  it('모든 인수가 falsy면 빈 문자열을 반환한다', () => {
    expect(cn(undefined, null, false)).toBe('');
  });

  it('단일 클래스를 그대로 반환한다', () => {
    expect(cn('only')).toBe('only');
  });
});

describe('isValidUrl', () => {
  it('http URL을 유효하다고 판단한다', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('https URL을 유효하다고 판단한다', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('경로와 쿼리가 포함된 URL을 유효하다고 판단한다', () => {
    expect(isValidUrl('https://example.com/path?q=1&a=2')).toBe(true);
  });

  it('빈 문자열을 무효로 판단한다', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('프로토콜이 없는 URL을 무효로 판단한다', () => {
    expect(isValidUrl('example.com')).toBe(false);
  });

  it('ftp 프로토콜을 무효로 판단한다', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
  });

  it('일반 문자열을 무효로 판단한다', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });
});

describe('isValidNaverRssUrl', () => {
  it('유효한 네이버 RSS URL을 유효하다고 판단한다', () => {
    expect(isValidNaverRssUrl('https://rss.blog.naver.com/myblog.xml')).toBe(true);
  });

  it('http 네이버 RSS URL도 유효하다고 판단한다', () => {
    expect(isValidNaverRssUrl('http://rss.blog.naver.com/myblog.xml')).toBe(true);
  });

  it('.xml로 끝나지 않으면 무효로 판단한다', () => {
    expect(isValidNaverRssUrl('https://rss.blog.naver.com/myblog')).toBe(false);
  });

  it('rss.blog.naver.com 도메인이 없으면 무효로 판단한다', () => {
    expect(isValidNaverRssUrl('https://blog.naver.com/myblog.xml')).toBe(false);
  });

  it('완전히 다른 URL을 무효로 판단한다', () => {
    expect(isValidNaverRssUrl('https://example.com/feed.xml')).toBe(false);
  });

  it('빈 문자열을 무효로 판단한다', () => {
    expect(isValidNaverRssUrl('')).toBe(false);
  });
});

describe('isNonEmptyString', () => {
  it('일반 문자열을 true로 판단한다', () => {
    expect(isNonEmptyString('hello')).toBe(true);
  });

  it('한국어 문자열을 true로 판단한다', () => {
    expect(isNonEmptyString('안녕하세요')).toBe(true);
  });

  it('빈 문자열을 false로 판단한다', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('공백만 있는 문자열을 false로 판단한다', () => {
    expect(isNonEmptyString('   ')).toBe(false);
  });

  it('탭만 있는 문자열을 false로 판단한다', () => {
    expect(isNonEmptyString('\t')).toBe(false);
  });

  it('null을 false로 판단한다', () => {
    expect(isNonEmptyString(null)).toBe(false);
  });

  it('undefined를 false로 판단한다', () => {
    expect(isNonEmptyString(undefined)).toBe(false);
  });

  it('숫자를 false로 판단한다', () => {
    expect(isNonEmptyString(42)).toBe(false);
  });

  it('배열을 false로 판단한다', () => {
    expect(isNonEmptyString(['hello'])).toBe(false);
  });

  it('객체를 false로 판단한다', () => {
    expect(isNonEmptyString({ value: 'hello' })).toBe(false);
  });
});

describe('formatKoreanDate', () => {
  it('날짜 문자열을 한국어 포맷으로 변환한다', () => {
    const result = formatKoreanDate('2024-01-15');
    expect(result).toContain('2024');
    expect(result).toContain('1월');
    expect(result).toContain('15');
  });

  it('ISO 날짜 문자열을 처리한다', () => {
    const result = formatKoreanDate('2024-06-01T00:00:00.000Z');
    expect(result).toContain('2024');
    expect(result).toContain('월');
  });

  it('무효한 날짜 문자열을 원본 그대로 반환한다', () => {
    const invalid = 'not-a-date';
    const result = formatKoreanDate(invalid);
    expect(result).toBe(invalid);
  });

  it('연도가 포함된 형식으로 반환한다', () => {
    const result = formatKoreanDate('2023-12-25');
    expect(result).toContain('2023');
    expect(result).toContain('12월');
    expect(result).toContain('25');
  });
});

describe('formatReviewDate', () => {
  it('기본 옵션으로 월/일 형식을 반환한다', () => {
    const result = formatReviewDate('2024-03-15');
    expect(result).toMatch(/3월|15일/);
  });

  it('빈 문자열이면 빈 문자열을 반환한다', () => {
    expect(formatReviewDate('')).toBe('');
  });

  it('무효한 날짜 문자열을 원본 그대로 반환한다', () => {
    const invalid = 'invalid-date';
    expect(formatReviewDate(invalid)).toBe(invalid);
  });

  it('커스텀 옵션으로 연/월/일 형식을 반환한다', () => {
    const result = formatReviewDate('2024-01-05', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(result).toContain('2024');
    expect(result).toContain('1월');
    expect(result).toContain('5');
  });

  it('커스텀 옵션으로 연도만 포함된 포맷을 반환한다', () => {
    const result = formatReviewDate('2024-06-20', { year: 'numeric' });
    expect(result).toContain('2024');
  });
});

describe('sanitizeFileName', () => {
  it('영문자와 숫자는 그대로 유지한다', () => {
    expect(sanitizeFileName('hello123')).toBe('hello123');
  });

  it('한글은 그대로 유지한다', () => {
    expect(sanitizeFileName('안녕하세요')).toBe('안녕하세요');
  });

  it('공백을 대시로 변환한다', () => {
    expect(sanitizeFileName('hello world')).toBe('hello-world');
  });

  it('특수문자를 대시로 변환하고 끝의 대시는 제거한다', () => {
    expect(sanitizeFileName('file@name!')).toBe('file-name');
  });

  it('연속된 특수문자를 단일 대시로 변환한다', () => {
    expect(sanitizeFileName('a  b')).toBe('a-b');
  });

  it('앞뒤 대시를 제거한다', () => {
    expect(sanitizeFileName('!hello!')).toBe('hello');
  });

  it('점을 대시로 변환한다', () => {
    expect(sanitizeFileName('file.name.ts')).toBe('file-name-ts');
  });

  it('한글과 영문 혼합을 처리한다', () => {
    expect(sanitizeFileName('리뷰-review')).toBe('리뷰-review');
  });
});

describe('unique', () => {
  it('중복 숫자를 제거한다', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it('중복 문자열을 제거한다', () => {
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('빈 배열을 그대로 반환한다', () => {
    expect(unique([])).toEqual([]);
  });

  it('이미 유니크한 배열을 그대로 반환한다', () => {
    expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('원소가 하나인 배열을 그대로 반환한다', () => {
    expect(unique([42])).toEqual([42]);
  });

  it('첫 번째 등장 순서를 유지한다', () => {
    expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
  });
});

describe('stripHtmlTags', () => {
  it('단순 HTML 태그를 제거한다', () => {
    expect(stripHtmlTags('<p>hello</p>')).toBe('hello');
  });

  it('중첩 태그를 제거한다', () => {
    expect(stripHtmlTags('<div><p><strong>text</strong></p></div>')).toBe('text');
  });

  it('속성이 있는 태그를 제거한다', () => {
    expect(stripHtmlTags('<a href="http://example.com">링크</a>')).toBe('링크');
  });

  it('자기닫힘 태그를 제거한다', () => {
    expect(stripHtmlTags('before<br/>after')).toBe('beforeafter');
  });

  it('빈 문자열을 그대로 반환한다', () => {
    expect(stripHtmlTags('')).toBe('');
  });

  it('태그가 없는 문자열을 그대로 반환한다', () => {
    expect(stripHtmlTags('plain text')).toBe('plain text');
  });

  it('여러 종류의 태그를 한 번에 제거한다', () => {
    expect(stripHtmlTags('<h1>제목</h1><p>본문</p>')).toBe('제목본문');
  });
});

describe('normalizeText', () => {
  it('여러 공백을 단일 공백으로 정규화한다', () => {
    expect(normalizeText('hello   world')).toBe('hello world');
  });

  it('줄바꿈을 단일 공백으로 정규화한다', () => {
    expect(normalizeText('hello\nworld')).toBe('hello world');
  });

  it('탭을 단일 공백으로 정규화한다', () => {
    expect(normalizeText('hello\tworld')).toBe('hello world');
  });

  it('URL을 제거한다', () => {
    expect(normalizeText('visit http://example.com today')).toBe('visit  today');
  });

  it('https URL을 제거한다', () => {
    expect(normalizeText('링크: https://example.com/path?q=1')).toBe('링크:');
  });

  it('앞뒤 공백을 제거한다', () => {
    expect(normalizeText('  hello world  ')).toBe('hello world');
  });

  it('빈 문자열을 그대로 반환한다', () => {
    expect(normalizeText('')).toBe('');
  });

  it('공백만 있는 문자열을 빈 문자열로 반환한다', () => {
    expect(normalizeText('   ')).toBe('');
  });
});

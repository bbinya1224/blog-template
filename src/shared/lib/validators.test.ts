import { describe, it, expect } from 'vitest';
import {
  EMAIL_REGEX,
  DATE_REGEX,
  isValidEmail,
  isValidAnalyzePayload,
  isValidReviewPayload,
  isValidEditRequest,
} from './validators';
import { ValidationError } from './errors';

describe('EMAIL_REGEX', () => {
  it('유효한 이메일 형식을 통과시킨다', () => {
    expect(EMAIL_REGEX.test('user@example.com')).toBe(true);
    expect(EMAIL_REGEX.test('user.name@domain.co.kr')).toBe(true);
    expect(EMAIL_REGEX.test('user-name@sub.domain.com')).toBe(true);
  });

  it('유효하지 않은 이메일 형식을 거부한다', () => {
    expect(EMAIL_REGEX.test('notanemail')).toBe(false);
    expect(EMAIL_REGEX.test('@domain.com')).toBe(false);
    expect(EMAIL_REGEX.test('user@')).toBe(false);
    expect(EMAIL_REGEX.test('')).toBe(false);
  });
});

describe('DATE_REGEX', () => {
  it('YYYY-MM-DD 형식을 통과시킨다', () => {
    expect(DATE_REGEX.test('2024-01-15')).toBe(true);
    expect(DATE_REGEX.test('2024-12-31')).toBe(true);
    expect(DATE_REGEX.test('1999-06-01')).toBe(true);
  });

  it('잘못된 날짜 형식을 거부한다', () => {
    expect(DATE_REGEX.test('2024/01/15')).toBe(false);
    expect(DATE_REGEX.test('15-01-2024')).toBe(false);
    expect(DATE_REGEX.test('2024-1-5')).toBe(false);
    expect(DATE_REGEX.test('20240115')).toBe(false);
    expect(DATE_REGEX.test('')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('유효한 이메일에 true를 반환한다', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.kr')).toBe(true);
  });

  it('유효하지 않은 이메일에 false를 반환한다', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('non-string 입력에 false를 반환한다', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
    expect(isValidEmail({})).toBe(false);
    expect(isValidEmail([])).toBe(false);
  });
});

describe('isValidAnalyzePayload', () => {
  const validPayload = {
    rssUrl: 'https://rss.blog.naver.com/testblog.xml',
  };

  it('유효한 payload에서 true를 반환한다', () => {
    expect(isValidAnalyzePayload(validPayload)).toBe(true);
  });

  it('maxPosts가 있는 유효한 payload를 허용한다', () => {
    expect(isValidAnalyzePayload({ ...validPayload, maxPosts: 10 })).toBe(true);
    expect(isValidAnalyzePayload({ ...validPayload, maxPosts: 1 })).toBe(true);
    expect(isValidAnalyzePayload({ ...validPayload, maxPosts: 50 })).toBe(true);
  });

  it('null 또는 non-object 입력에 ValidationError를 던진다', () => {
    expect(() => isValidAnalyzePayload(null)).toThrow(ValidationError);
    expect(() => isValidAnalyzePayload(undefined)).toThrow(ValidationError);
    expect(() => isValidAnalyzePayload('문자열')).toThrow(ValidationError);
    expect(() => isValidAnalyzePayload(42)).toThrow(ValidationError);
  });

  it('rssUrl 누락 시 ValidationError를 던진다', () => {
    expect(() => isValidAnalyzePayload({})).toThrow(ValidationError);
    expect(() => isValidAnalyzePayload({ rssUrl: '' })).toThrow(ValidationError);
    expect(() => isValidAnalyzePayload({ rssUrl: '   ' })).toThrow(ValidationError);
  });

  it('유효하지 않은 네이버 RSS URL에 ValidationError를 던진다', () => {
    expect(() =>
      isValidAnalyzePayload({ rssUrl: 'https://example.com/feed.xml' }),
    ).toThrow(ValidationError);
    expect(() =>
      isValidAnalyzePayload({ rssUrl: 'https://rss.blog.naver.com/testblog' }),
    ).toThrow(ValidationError);
    expect(() =>
      isValidAnalyzePayload({ rssUrl: 'not-a-url' }),
    ).toThrow(ValidationError);
  });

  it('maxPosts가 1 미만이면 ValidationError를 던진다', () => {
    expect(() =>
      isValidAnalyzePayload({ ...validPayload, maxPosts: 0 }),
    ).toThrow(ValidationError);
    expect(() =>
      isValidAnalyzePayload({ ...validPayload, maxPosts: -1 }),
    ).toThrow(ValidationError);
  });

  it('maxPosts가 50 초과이면 ValidationError를 던진다', () => {
    expect(() =>
      isValidAnalyzePayload({ ...validPayload, maxPosts: 51 }),
    ).toThrow(ValidationError);
  });

  it('maxPosts가 숫자가 아니면 ValidationError를 던진다', () => {
    expect(() =>
      isValidAnalyzePayload({ ...validPayload, maxPosts: '10' }),
    ).toThrow(ValidationError);
  });

  it('maxPosts가 undefined이면 검증을 건너뛴다', () => {
    expect(isValidAnalyzePayload({ rssUrl: validPayload.rssUrl, maxPosts: undefined })).toBe(true);
  });
});

describe('isValidReviewPayload', () => {
  const validPayload = {
    name: '맛있는 식당',
    location: '서울 강남구',
    date: '2024-01-15',
    menu: '김치찌개',
  };

  it('유효한 payload에서 true를 반환한다', () => {
    expect(isValidReviewPayload(validPayload)).toBe(true);
  });

  it('null 또는 non-object 입력에 ValidationError를 던진다', () => {
    expect(() => isValidReviewPayload(null)).toThrow(ValidationError);
    expect(() => isValidReviewPayload('문자열')).toThrow(ValidationError);
    expect(() => isValidReviewPayload(123)).toThrow(ValidationError);
  });

  it('name 누락 또는 빈 문자열 시 ValidationError를 던진다', () => {
    expect(() => isValidReviewPayload({ ...validPayload, name: undefined })).toThrow(ValidationError);
    expect(() => isValidReviewPayload({ ...validPayload, name: '' })).toThrow(ValidationError);
    expect(() => isValidReviewPayload({ ...validPayload, name: '   ' })).toThrow(ValidationError);
  });

  it('location 누락 또는 빈 문자열 시 ValidationError를 던진다', () => {
    expect(() => isValidReviewPayload({ ...validPayload, location: undefined })).toThrow(ValidationError);
    expect(() => isValidReviewPayload({ ...validPayload, location: '' })).toThrow(ValidationError);
  });

  it('date 누락 또는 빈 문자열 시 ValidationError를 던진다', () => {
    expect(() => isValidReviewPayload({ ...validPayload, date: undefined })).toThrow(ValidationError);
    expect(() => isValidReviewPayload({ ...validPayload, date: '' })).toThrow(ValidationError);
  });

  it('menu 누락 또는 빈 문자열 시 ValidationError를 던진다', () => {
    expect(() => isValidReviewPayload({ ...validPayload, menu: undefined })).toThrow(ValidationError);
    expect(() => isValidReviewPayload({ ...validPayload, menu: '' })).toThrow(ValidationError);
  });

  it('YYYY-MM-DD 형식이 아닌 날짜에 ValidationError를 던진다', () => {
    expect(() =>
      isValidReviewPayload({ ...validPayload, date: '2024/01/15' }),
    ).toThrow(ValidationError);
    expect(() =>
      isValidReviewPayload({ ...validPayload, date: '15-01-2024' }),
    ).toThrow(ValidationError);
    expect(() =>
      isValidReviewPayload({ ...validPayload, date: '20240115' }),
    ).toThrow(ValidationError);
  });

  it('형식은 맞지만 유효하지 않은 날짜에 ValidationError를 던진다', () => {
    expect(() =>
      isValidReviewPayload({ ...validPayload, date: '2024-13-01' }),
    ).toThrow(ValidationError);
  });
});

describe('isValidEditRequest', () => {
  const validPayload = {
    review: '원본 리뷰 내용입니다.',
    request: '더 친근한 톤으로 수정해주세요.',
  };

  it('유효한 payload에서 true를 반환한다', () => {
    expect(isValidEditRequest(validPayload)).toBe(true);
  });

  it('null 또는 non-object 입력에 ValidationError를 던진다', () => {
    expect(() => isValidEditRequest(null)).toThrow(ValidationError);
    expect(() => isValidEditRequest(undefined)).toThrow(ValidationError);
    expect(() => isValidEditRequest('문자열')).toThrow(ValidationError);
  });

  it('review 누락 또는 빈 문자열 시 ValidationError를 던진다', () => {
    expect(() => isValidEditRequest({ ...validPayload, review: undefined })).toThrow(ValidationError);
    expect(() => isValidEditRequest({ ...validPayload, review: '' })).toThrow(ValidationError);
    expect(() => isValidEditRequest({ ...validPayload, review: '   ' })).toThrow(ValidationError);
  });

  it('request 누락 또는 빈 문자열 시 ValidationError를 던진다', () => {
    expect(() => isValidEditRequest({ ...validPayload, request: undefined })).toThrow(ValidationError);
    expect(() => isValidEditRequest({ ...validPayload, request: '' })).toThrow(ValidationError);
    expect(() => isValidEditRequest({ ...validPayload, request: '   ' })).toThrow(ValidationError);
  });

  it('던져진 에러가 ValidationError 인스턴스임을 확인한다', () => {
    try {
      isValidEditRequest({ review: '', request: '요청' });
      expect.fail('throw되어야 합니다');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
    }
  });
});

import { describe, expect, it } from 'vitest';
import {
  buildViewerAndMobileUrls,
  downgradeToHttp,
  enforceHttps,
  isProtocolError,
  parseNaverBlogUrl,
} from './urlUtils';

describe('parseNaverBlogUrl', () => {
  describe('경로 기반 URL', () => {
    it('경로에서 blogId와 logNo를 추출한다', () => {
      const result = parseNaverBlogUrl('https://blog.naver.com/myblog/12345');
      expect(result).toEqual({ blogId: 'myblog', logNo: '12345' });
    });

    it('blogId만 있는 경로는 logNo를 undefined로 반환한다', () => {
      const result = parseNaverBlogUrl('https://blog.naver.com/myblog');
      expect(result).toEqual({ blogId: 'myblog', logNo: undefined });
    });
  });

  describe('쿼리 파라미터 기반 URL', () => {
    it('쿼리 파라미터에서 blogId와 logNo를 추출한다', () => {
      const result = parseNaverBlogUrl(
        'https://blog.naver.com/PostView.naver?blogId=myblog&logNo=12345',
      );
      expect(result).toEqual({ blogId: 'myblog', logNo: '12345' });
    });

    it('쿼리 blogId가 경로 blogId보다 우선한다', () => {
      const result = parseNaverBlogUrl(
        'https://blog.naver.com/pathblog/99999?blogId=queryblog&logNo=12345',
      );
      // pathLogNo(99999)가 searchLogNo(12345)보다 우선 (logNo = pathLogNo || searchLogNo)
      expect(result).toEqual({ blogId: 'queryblog', logNo: '99999' });
    });

    it('경로 logNo가 쿼리 logNo보다 우선한다', () => {
      const result = parseNaverBlogUrl(
        'https://blog.naver.com/myblog/11111?logNo=22222',
      );
      expect(result).toEqual({ blogId: 'myblog', logNo: '11111' });
    });
  });

  describe('하이픈 포함 blogId', () => {
    it('하이픈이 포함된 blogId를 허용한다', () => {
      const result = parseNaverBlogUrl('https://blog.naver.com/my-blog/12345');
      expect(result).toEqual({ blogId: 'my-blog', logNo: '12345' });
    });
  });

  describe('무효한 URL', () => {
    it('완전히 잘못된 URL은 빈 객체를 반환한다', () => {
      expect(parseNaverBlogUrl('not-a-url')).toEqual({});
    });

    it('빈 문자열은 빈 객체를 반환한다', () => {
      expect(parseNaverBlogUrl('')).toEqual({});
    });

    it('blogId에 특수문자가 포함되면 빈 객체를 반환한다', () => {
      expect(parseNaverBlogUrl('https://blog.naver.com/my blog/12345')).toEqual(
        {},
      );
    });

    it('logNo가 숫자가 아니면 빈 객체를 반환한다', () => {
      expect(
        parseNaverBlogUrl('https://blog.naver.com/myblog/abc'),
      ).toEqual({});
    });
  });
});

describe('buildViewerAndMobileUrls', () => {
  it('blogId와 logNo가 있으면 postViewer, 모바일, 원본 URL을 반환한다', () => {
    const urls = buildViewerAndMobileUrls('https://blog.naver.com/myblog/12345');
    expect(urls).toEqual([
      'https://blog.naver.com/PostView.naver?blogId=myblog&logNo=12345',
      'https://m.blog.naver.com/myblog/12345',
      'https://blog.naver.com/myblog/12345',
    ]);
  });

  it('blogId나 logNo가 없으면 원본 URL만 반환한다', () => {
    const urls = buildViewerAndMobileUrls('https://blog.naver.com/myblog');
    expect(urls).toEqual(['https://blog.naver.com/myblog']);
  });

  it('무효한 URL이면 원본 URL만 반환한다', () => {
    const urls = buildViewerAndMobileUrls('not-a-url');
    expect(urls).toEqual(['not-a-url']);
  });

  it('항상 원본 URL을 마지막에 포함한다', () => {
    const original = 'https://blog.naver.com/myblog/12345';
    const urls = buildViewerAndMobileUrls(original);
    expect(urls[urls.length - 1]).toBe(original);
  });
});

describe('enforceHttps', () => {
  it('http URL을 https로 변환한다', () => {
    expect(enforceHttps('http://example.com/path')).toBe(
      'https://example.com/path',
    );
  });

  it('이미 https인 URL은 그대로 반환한다', () => {
    expect(enforceHttps('https://example.com/path')).toBe(
      'https://example.com/path',
    );
  });

  it('프로토콜이 없는 URL은 변환하지 않는다', () => {
    expect(enforceHttps('example.com/path')).toBe('example.com/path');
  });
});

describe('downgradeToHttp', () => {
  it('https URL을 http로 변환한다', () => {
    expect(downgradeToHttp('https://example.com/path')).toBe(
      'http://example.com/path',
    );
  });

  it('이미 http인 URL은 그대로 반환한다', () => {
    expect(downgradeToHttp('http://example.com/path')).toBe(
      'http://example.com/path',
    );
  });

  it('프로토콜이 없는 URL은 변환하지 않는다', () => {
    expect(downgradeToHttp('example.com/path')).toBe('example.com/path');
  });
});

describe('isProtocolError', () => {
  describe('프로토콜 에러 코드', () => {
    it.each([
      'ERR_SSL_PROTOCOL_ERROR',
      'EPROTO',
      'CERT_HAS_EXPIRED',
      'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
      'ERR_TLS_CERT_ALTNAME_INVALID',
    ])('code가 %s이면 true를 반환한다', (code) => {
      expect(isProtocolError({ code })).toBe(true);
    });
  });

  describe('프로토콜 관련 메시지', () => {
    it.each([
      'SSL handshake failed',
      'certificate has expired',
      'TLS connection error',
      'HTTPS not supported',
    ])('message에 "%s"가 포함되면 true를 반환한다', (message) => {
      expect(isProtocolError({ message })).toBe(true);
    });
  });

  describe('일반 에러', () => {
    it('관련 없는 에러 코드는 false를 반환한다', () => {
      expect(isProtocolError({ code: 'ECONNREFUSED', message: 'connect failed' })).toBe(false);
    });

    it('null은 false를 반환한다', () => {
      expect(isProtocolError(null)).toBe(false);
    });

    it('문자열은 false를 반환한다', () => {
      expect(isProtocolError('SSL error')).toBe(false);
    });

    it('빈 객체는 false를 반환한다', () => {
      expect(isProtocolError({})).toBe(false);
    });

    it('undefined는 false를 반환한다', () => {
      expect(isProtocolError(undefined)).toBe(false);
    });
  });
});

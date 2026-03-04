import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  RssCrawlingError,
  StyleAnalysisError,
  TimeoutError,
  RateLimitError,
  RetryExhaustedError,
  HttpError,
  SSEError,
  Ok,
  Err,
  unwrap,
} from './errors';

describe('AppError', () => {
  it('message, code, statusCode, name을 올바르게 설정한다', () => {
    const error = new AppError('서버 오류', 'SERVER_ERROR', 500);
    expect(error.message).toBe('서버 오류');
    expect(error.code).toBe('SERVER_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('AppError');
  });

  it('statusCode 기본값은 500이다', () => {
    const error = new AppError('오류', 'SOME_CODE');
    expect(error.statusCode).toBe(500);
  });

  it('Error를 상속한다', () => {
    const error = new AppError('오류', 'CODE');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('ValidationError', () => {
  it('message, code, statusCode, name을 올바르게 설정한다', () => {
    const error = new ValidationError('입력값이 잘못되었습니다.');
    expect(error.message).toBe('입력값이 잘못되었습니다.');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
  });

  it('AppError와 Error를 상속한다', () => {
    const error = new ValidationError('검증 실패');
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('NotFoundError', () => {
  it('message, code, statusCode, name을 올바르게 설정한다', () => {
    const error = new NotFoundError('리소스를 찾을 수 없습니다.');
    expect(error.message).toBe('리소스를 찾을 수 없습니다.');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
  });

  it('AppError를 상속한다', () => {
    const error = new NotFoundError('없음');
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('RssCrawlingError', () => {
  it('message, code, statusCode, name을 올바르게 설정한다', () => {
    const error = new RssCrawlingError('RSS 파싱 실패');
    expect(error.message).toBe('RSS 파싱 실패');
    expect(error.code).toBe('RSS_CRAWLING_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('RssCrawlingError');
  });

  it('AppError를 상속한다', () => {
    expect(new RssCrawlingError('오류')).toBeInstanceOf(AppError);
  });
});

describe('StyleAnalysisError', () => {
  it('message, code, statusCode, name을 올바르게 설정한다', () => {
    const error = new StyleAnalysisError('스타일 분석 실패');
    expect(error.message).toBe('스타일 분석 실패');
    expect(error.code).toBe('STYLE_ANALYSIS_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('StyleAnalysisError');
  });

  it('AppError를 상속한다', () => {
    expect(new StyleAnalysisError('오류')).toBeInstanceOf(AppError);
  });
});

describe('TimeoutError', () => {
  it('message, code, statusCode, name, timeoutMs를 올바르게 설정한다', () => {
    const error = new TimeoutError('요청 시간 초과', 3000);
    expect(error.message).toBe('요청 시간 초과');
    expect(error.code).toBe('TIMEOUT');
    expect(error.statusCode).toBe(408);
    expect(error.name).toBe('TimeoutError');
    expect(error.timeoutMs).toBe(3000);
  });

  it('AppError를 상속한다', () => {
    expect(new TimeoutError('타임아웃', 1000)).toBeInstanceOf(AppError);
  });
});

describe('RateLimitError', () => {
  it('message, code, statusCode, name을 올바르게 설정한다', () => {
    const error = new RateLimitError('요청 한도 초과');
    expect(error.message).toBe('요청 한도 초과');
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(error.statusCode).toBe(429);
    expect(error.name).toBe('RateLimitError');
  });

  it('retryAfterMs를 선택적으로 설정한다', () => {
    const withRetry = new RateLimitError('한도 초과', 5000);
    expect(withRetry.retryAfterMs).toBe(5000);

    const withoutRetry = new RateLimitError('한도 초과');
    expect(withoutRetry.retryAfterMs).toBeUndefined();
  });

  it('AppError를 상속한다', () => {
    expect(new RateLimitError('오류')).toBeInstanceOf(AppError);
  });
});

describe('RetryExhaustedError', () => {
  it('message, code, statusCode, name, attempts, lastError를 올바르게 설정한다', () => {
    const lastErr = new Error('마지막 오류');
    const error = new RetryExhaustedError('재시도 소진', 3, lastErr);
    expect(error.message).toBe('재시도 소진');
    expect(error.code).toBe('RETRY_EXHAUSTED');
    expect(error.statusCode).toBe(503);
    expect(error.name).toBe('RetryExhaustedError');
    expect(error.attempts).toBe(3);
    expect(error.lastError).toBe(lastErr);
  });

  it('lastError로 어떤 값이든 허용한다', () => {
    const error = new RetryExhaustedError('소진', 1, '문자열 에러');
    expect(error.lastError).toBe('문자열 에러');
  });

  it('AppError를 상속한다', () => {
    expect(new RetryExhaustedError('오류', 1, null)).toBeInstanceOf(AppError);
  });
});

describe('HttpError', () => {
  it('message, statusCode, name을 올바르게 설정한다', () => {
    const error = new HttpError('HTTP 오류', 503);
    expect(error.message).toBe('HTTP 오류');
    expect(error.statusCode).toBe(503);
    expect(error.name).toBe('HttpError');
  });

  it('code를 지정하지 않으면 HTTP_{statusCode}를 사용한다', () => {
    const error = new HttpError('오류', 503);
    expect(error.code).toBe('HTTP_503');
  });

  it('code를 명시적으로 지정할 수 있다', () => {
    const error = new HttpError('오류', 503, 'SERVICE_UNAVAILABLE');
    expect(error.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('AppError를 상속한다', () => {
    expect(new HttpError('오류', 500)).toBeInstanceOf(AppError);
  });
});

describe('SSEError', () => {
  it('message, code, statusCode, name을 올바르게 설정한다', () => {
    const error = new SSEError('SSE 연결 실패');
    expect(error.message).toBe('SSE 연결 실패');
    expect(error.code).toBe('SSE_ERROR');
    expect(error.statusCode).toBe(502);
    expect(error.name).toBe('SSEError');
  });

  it('AppError를 상속한다', () => {
    expect(new SSEError('오류')).toBeInstanceOf(AppError);
  });
});

describe('Ok', () => {
  it('success: true와 data를 반환한다', () => {
    const result = Ok('데이터');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('데이터');
    }
  });

  it('객체, 배열, null 등 다양한 타입을 래핑한다', () => {
    expect(Ok({ id: 1 }).data).toEqual({ id: 1 });
    expect(Ok([1, 2, 3]).data).toEqual([1, 2, 3]);
    expect(Ok(null).data).toBeNull();
    expect(Ok(0).data).toBe(0);
    expect(Ok(false).data).toBe(false);
  });
});

describe('Err', () => {
  it('success: false와 error를 반환한다', () => {
    const error = new AppError('오류', 'CODE');
    const result = Err(error);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(error);
    }
  });

  it('어떤 타입의 에러도 래핑한다', () => {
    const strErr = Err('문자열 에러');
    expect(strErr.success).toBe(false);
    if (!strErr.success) {
      expect(strErr.error).toBe('문자열 에러');
    }
  });
});

describe('unwrap', () => {
  it('Ok(data)에서 data를 반환한다', () => {
    expect(unwrap(Ok(42))).toBe(42);
    expect(unwrap(Ok('hello'))).toBe('hello');
    expect(unwrap(Ok(null))).toBeNull();
  });

  it('Err(error)에서 error를 throw한다', () => {
    const error = new AppError('언래핑 오류', 'CODE');
    expect(() => unwrap(Err(error))).toThrow(error);
  });

  it('Err에서 throw된 에러가 원본 에러와 동일하다', () => {
    const error = new ValidationError('검증 실패');
    try {
      unwrap(Err(error));
      expect.fail('throw되어야 합니다');
    } catch (e) {
      expect(e).toBe(error);
      expect(e).toBeInstanceOf(ValidationError);
    }
  });
});

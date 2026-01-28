export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RssCrawlingError extends AppError {
  constructor(message: string) {
    super(message, 'RSS_CRAWLING_ERROR', 500);
    this.name = 'RssCrawlingError';
  }
}

export class StyleAnalysisError extends AppError {
  constructor(message: string) {
    super(message, 'STYLE_ANALYSIS_ERROR', 500);
    this.name = 'StyleAnalysisError';
  }
}

export class TimeoutError extends AppError {
  constructor(
    message: string,
    public readonly timeoutMs: number,
  ) {
    super(message, 'TIMEOUT', 408);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string,
    public readonly retryAfterMs?: number,
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}

export class RetryExhaustedError extends AppError {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: unknown,
  ) {
    super(message, 'RETRY_EXHAUSTED', 503);
    this.name = 'RetryExhaustedError';
  }
}

/**
 * Result 타입 - 함수형 에러 처리
 */
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export const Ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const Err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

/**
 * Result를 unwrap하는 유틸리티
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.success) {
    return result.data;
  }
  throw result.error;
};
